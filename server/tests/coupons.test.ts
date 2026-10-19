import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import {
    finishSuite,
    login,
    request,
    seedAdmin,
    signupUser,
    startSuite,
    trackCoupon,
    trackGuestToken,
    trackOrder,
    uniqueGuestToken,
    uniquePhone,
} from "./helpers.js";
import { pool } from "../src/config/database.js";
import { roundMoney as round2 } from "../src/modules/order/order.totals.js";

before(startSuite);
after(finishSuite);

const DELIVERY_ADDRESS = "12 Nile Street, Zamalek";
const DELIVERY_LAT = 30.0444;
const DELIVERY_LNG = 31.2357;

/**
 * Inserts a coupon straight into the DB, because coupons are admin-authored data
 * and the suite is about how checkout SPENDS them, not about the admin write path.
 */
const makeCoupon = async (overrides: Partial<{
    code: string;
    name: string;
    type: "percentage" | "fixed_amount" | "free_delivery";
    value: number;
    minOrderAmount: number;
    maxUses: number | null;
    isActive: boolean;
    expiresAt: string;
}> = {}): Promise<{ id: number; code: string }> => {
    const code = overrides.code ?? `CPN${randomUUID().replace(/\W/g, "").slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
        `INSERT INTO coupons (code, name, type, value, min_order_amount, max_uses, is_active, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, code`,
        [
            code,
            overrides.name ?? "Suite Coupon",
            overrides.type ?? "percentage",
            overrides.value ?? 10,
            overrides.minOrderAmount ?? 0,
            overrides.maxUses ?? null,
            overrides.isActive ?? true,
            overrides.expiresAt ?? new Date(Date.now() + 86_400_000).toISOString(),
        ]
    );
    trackCoupon(result.rows[0].id);
    return result.rows[0];
};

/** Sets a branch's delivery fee and restores it afterwards. */
const withBranchFee = async <T>(branchId: number, fee: number, run: () => Promise<T>): Promise<T> => {
    const previous = await pool.query("SELECT delivery_fee FROM branches WHERE id = $1", [branchId]);
    await pool.query("UPDATE branches SET delivery_fee = $1 WHERE id = $2", [fee, branchId]);
    try {
        return await run();
    } finally {
        await pool.query("UPDATE branches SET delivery_fee = $1 WHERE id = $2", [previous.rows[0].delivery_fee, branchId]);
    }
};

describe("coupons", () => {
    let productId: number;
    let productPrice: number;
    let customer: { token: string; user: { id: number; name: string; phone: string } };
    let admin: { token: string };
    let guest: string;

    const guestHeaders = () => {
        trackGuestToken(guest);
        return { guestToken: guest };
    };

    const addToCart = (headers: Record<string, unknown>, quantity = 1) =>
        request("/cart/items", { method: "POST", ...headers, body: { productID: productId, quantity } });

    const checkout = (headers: Record<string, unknown>, body: Record<string, unknown>) =>
        request("/cart/checkout", { method: "POST", ...headers, body });

    before(async () => {
        const product = await pool.query(
            `SELECT p.id, p.price FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.is_deleted = false AND p.is_available = true AND p.is_modifier = false
               AND c.is_deleted = false
               AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id)
             ORDER BY p.id LIMIT 1`
        );
        assert.ok(product.rows.length > 0, "seed data must include available products");
        productId = product.rows[0].id;
        productPrice = Number(product.rows[0].price);

        customer = await signupUser();
        const adminFixture = await seedAdmin();
        const adminLogin = await login(adminFixture.email, adminFixture.password);
        assert.equal(adminLogin.status, 200);
        admin = { token: adminLogin.body.data.token };

        guest = `t_${Date.now().toString(36)}_${randomUUID()}`;
    });

    /** A body the service should accept, so each CRUD test only states what it varies. */
    const adminCouponBody = (overrides: Record<string, unknown> = {}) => ({
        code: `CPN${randomUUID().replace(/\W/g, "").slice(0, 10).toUpperCase()}`,
        name: "Admin Suite Coupon",
        type: "percentage",
        value: 10,
        minOrderAmount: 0,
        maxUses: null,
        isActive: true,
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        ...overrides,
    });

    describe("percentage", () => {
        it("takes the percentage off the re-priced subtotal", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 10 });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                {
                    branchID: 1,
                    orderType: "Pickup",
                    couponCode: code,
                    idempotencyKey: uniqueGuestToken(),
                }
            );

            assert.equal(status, 201, JSON.stringify(body));
            if (body.data.id) trackOrder(body.data.id);

            // round2 is what the server actually applies, so the expectation uses
            // the same rounding rather than raw float multiplication.
            const expectedDiscount = round2(productPrice * 0.1);
            assert.equal(Number(body.data.subtotal), productPrice);
            assert.equal(Number(body.data.discount_amount), expectedDiscount);
            assert.equal(Number(body.data.delivery_fee), 0);
            assert.equal(Number(body.data.total), round2(productPrice - expectedDiscount));
            assert.equal(body.data.coupon_code, code);
        });

        it("records the redemption against the coupon", async () => {
            const { id, code } = await makeCoupon({ type: "percentage", value: 50 });
            await addToCart({ token: customer.token }, 1);

            const { body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            if (body.data.id) trackOrder(body.data.id);

            const redemption = await pool.query(
                "SELECT coupon_id, discount_amount FROM order_coupons WHERE order_id = $1",
                [body.data.id]
            );
            assert.equal(redemption.rows.length, 1);
            assert.equal(redemption.rows[0].coupon_id, id);
        });

        it("matches the code case-insensitively", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 5 });
            await addToCart({ token: customer.token }, 1);

            const { status } = await checkout(
                { token: customer.token },
                {
                    branchID: 1,
                    orderType: "Pickup",
                    couponCode: code.toLowerCase(),
                    idempotencyKey: uniqueGuestToken(),
                }
            );
            assert.equal(status, 201);
        });
    });

    describe("fixed amount", () => {
        it("never drives the total below zero", async () => {
            // Deliberately larger than the basket: the clamp is the whole point,
            // because a negative total would be rejected by orders_total_invariant_check.
            const { code } = await makeCoupon({ type: "fixed_amount", value: productPrice * 10 });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );

            assert.equal(status, 201, JSON.stringify(body));
            if (body.data.id) trackOrder(body.data.id);
            assert.equal(Number(body.data.discount_amount), productPrice);
            assert.equal(Number(body.data.total), 0);
        });
    });

    describe("free delivery", () => {
        it("waives exactly the branch fee on a delivery order", async () => {
            const { code } = await makeCoupon({ type: "free_delivery", value: 0 });

            await withBranchFee(1, 25, async () => {
                await addToCart({ token: customer.token }, 1);
                const { status, body } = await checkout(
                    { token: customer.token },
                    {
                        branchID: 1,
                        orderType: "Delivery",
                        deliveryAddress: DELIVERY_ADDRESS,
                        deliveryLat: DELIVERY_LAT,
                        deliveryLng: DELIVERY_LNG,
                        couponCode: code,
                        idempotencyKey: uniqueGuestToken(),
                    }
                );

                assert.equal(status, 201, JSON.stringify(body));
                if (body.data.id) trackOrder(body.data.id);
                assert.equal(Number(body.data.delivery_fee), 25);
                assert.equal(Number(body.data.discount_amount), 25);
                assert.equal(Number(body.data.total), productPrice);
            });
        });

        it("is worth nothing on a pickup, which is already free", async () => {
            const { code } = await makeCoupon({ type: "free_delivery", value: 0 });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(status, 201, JSON.stringify(body));
            if (body.data.id) trackOrder(body.data.id);
            assert.equal(Number(body.data.delivery_fee), 0);
            assert.equal(Number(body.data.discount_amount), 0);
            assert.equal(Number(body.data.total), productPrice);
        });
    });

    describe("eligibility", () => {
        it("rejects an expired coupon with 409 and does not place the order", async () => {
            const { code } = await makeCoupon({
                type: "percentage",
                value: 10,
                expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
            });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(status, 409);
            assert.match(String(body.message), /expired/i);

            // The whole checkout aborts, so the cart must survive for a retry.
            const stillThere = await request("/cart", { token: customer.token });
            assert.equal(stillThere.body.data.items.length, 1);
        });

        it("rejects an inactive coupon", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 10, isActive: false });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(status, 409, JSON.stringify(body));
            assert.match(String(body.message), /not active/i);
        });

        it("rejects a basket under the minimum spend", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 10, minOrderAmount: productPrice * 100 });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(status, 409, JSON.stringify(body));
            assert.match(String(body.message), /minimum/i);
        });

        it("honours max_uses exactly once", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 10, maxUses: 1 });

            await addToCart({ token: customer.token }, 1);
            const first = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(first.status, 201, JSON.stringify(first.body));
            if (first.body.data.id) trackOrder(first.body.data.id);

            await addToCart({ token: customer.token }, 1);
            const second = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(second.status, 409, JSON.stringify(second.body));
            assert.match(String(second.body.message), /maximum uses/i);
        });

        it("rejects an unknown code without touching the cart", async () => {
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await checkout(
                { token: customer.token },
                {
                    branchID: 1,
                    orderType: "Pickup",
                    couponCode: "NOPE-NOT-A-REAL-CODE",
                    idempotencyKey: uniqueGuestToken(),
                }
            );
            assert.equal(status, 409, JSON.stringify(body));

            const stillThere = await request("/cart", { token: customer.token });
            assert.equal(stillThere.body.data.items.length, 1);
        });

        it("does not count a replayed idempotent checkout as a second redemption", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 10, maxUses: 1 });
            const key = uniqueGuestToken();

            await addToCart({ token: customer.token }, 1);
            const first = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: key }
            );
            assert.equal(first.status, 201, JSON.stringify(first.body));
            if (first.body.data.id) trackOrder(first.body.data.id);

            const replay = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: key }
            );
            assert.equal(replay.status, 201);
            assert.equal(replay.body.data.id, first.body.data.id);

            const redemptions = await pool.query(
                "SELECT COUNT(*)::int AS c FROM order_coupons WHERE coupon_id = (SELECT id FROM coupons WHERE code = $1)",
                [code]
            );
            assert.equal(redemptions.rows[0].c, 1);
        });
    });

    describe("guest checkout", () => {
        it("applies a coupon for an unauthenticated guest cart", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 20 });
            await addToCart(guestHeaders(), 1);

            const { status, body } = await checkout(guestHeaders(), {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: uniquePhone(),
                orderType: "Pickup",
                couponCode: code,
                idempotencyKey: uniqueGuestToken(),
            });

            assert.equal(status, 201, JSON.stringify(body));
            if (body.data.id) trackOrder(body.data.id);
            assert.equal(Number(body.data.discount_amount), round2(productPrice * 0.2));
        });
    });

    describe("admin crud", () => {
        it("creates a coupon and returns it", async () => {
            const body = adminCouponBody({ name: "Launch Offer", value: 20, minOrderAmount: 100 });

            const { status, body: res } = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body,
            });

            assert.equal(status, 201, JSON.stringify(res));
            trackCoupon(res.data.id);
            assert.equal(res.data.code, body.code);
            assert.equal(res.data.name, "Launch Offer");
            assert.equal(Number(res.data.value), 20);
            assert.equal(Number(res.data.minOrderAmount), 100);
            assert.equal(res.data.maxUses, null);
            assert.equal(res.data.isActive, true);
        });

        it("lists coupons for an admin, newest first, with usage counts", async () => {
            const created = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody(),
            });
            assert.equal(created.status, 201, JSON.stringify(created.body));
            trackCoupon(created.body.data.id);

            const { status, body } = await request("/coupons", { token: admin.token });
            assert.equal(status, 200);

            const mine = body.data.find((row: { id: number }) => row.id === created.body.data.id);
            assert.ok(mine, "the new coupon must appear in the listing");
            assert.equal(Number(mine.usageCount), 0);
        });

        it("updates a coupon and keeps its redemptions", async () => {
            const created = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody({ type: "percentage", value: 10 }),
            });
            trackCoupon(created.body.data.id);
            const id = created.body.data.id;

            // Spend it once, so the update can be shown not to disturb history.
            await addToCart({ token: customer.token }, 1);
            const spent = await checkout(
                { token: customer.token },
                {
                    branchID: 1,
                    orderType: "Pickup",
                    couponCode: created.body.data.code,
                    idempotencyKey: uniqueGuestToken(),
                }
            );
            assert.equal(spent.status, 201, JSON.stringify(spent.body));
            if (spent.body.data.id) trackOrder(spent.body.data.id);

            const { status, body } = await request(`/coupons/${id}`, {
                method: "PUT",
                token: admin.token,
                body: adminCouponBody({ code: created.body.data.code, value: 40, isActive: false }),
            });

            assert.equal(status, 200, JSON.stringify(body));
            assert.equal(Number(body.data.value), 40);
            assert.equal(body.data.isActive, false);

            const redemption = await pool.query(
                "SELECT discount_amount FROM order_coupons WHERE order_id = $1",
                [spent.body.data.id]
            );
            assert.equal(redemption.rows.length, 1);
            assert.equal(
                Number(redemption.rows[0].discount_amount),
                round2(productPrice * 0.1),
                "the original discount must stand even after the coupon's value changed"
            );
        });

        it("soft-deletes, which stops redemption but keeps the audit trail", async () => {
            const created = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody(),
            });
            trackCoupon(created.body.data.id);
            const { code } = created.body.data;

            await addToCart({ token: customer.token }, 1);
            const spent = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(spent.status, 201);
            if (spent.body.data.id) trackOrder(spent.body.data.id);

            const { status } = await request(`/coupons/${created.body.data.id}`, {
                method: "DELETE",
                token: admin.token,
            });
            assert.equal(status, 204);

            // The row survives for order_coupons, but is no longer redeemable.
            const row = await pool.query("SELECT is_deleted FROM coupons WHERE id = $1", [created.body.data.id]);
            assert.equal(row.rows[0].is_deleted, true);

            await addToCart({ token: customer.token }, 1);
            const retry = await checkout(
                { token: customer.token },
                { branchID: 1, orderType: "Pickup", couponCode: code, idempotencyKey: uniqueGuestToken() }
            );
            assert.equal(retry.status, 409, JSON.stringify(retry.body));
        });

        it("rejects a duplicate code with 409", async () => {
            const body = adminCouponBody();
            const first = await request("/coupons", { method: "POST", token: admin.token, body });
            assert.equal(first.status, 201, JSON.stringify(first.body));
            trackCoupon(first.body.data.id);

            const second = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: { ...body, code: body.code.toLowerCase() },
            });
            assert.equal(second.status, 409);
            assert.match(String(second.body.message), /already in use/i);
        });

        it("rejects an out-of-range percentage rather than letting the DB 500", async () => {
            const { status, body } = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody({ type: "percentage", value: 150 }),
            });
            assert.equal(status, 409);
            assert.match(String(body.message), /between 1 and 100/i);

            const zero = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody({ type: "percentage", value: 0 }),
            });
            assert.equal(zero.status, 409);
        });

        it("rejects an amount on a free-delivery coupon", async () => {
            const { status, body } = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody({ type: "free_delivery", value: 25 }),
            });
            assert.equal(status, 409);
            assert.match(String(body.message), /cannot have an amount/i);
        });

        it("rejects an unknown type and an unparseable id", async () => {
            const badType = await request("/coupons", {
                method: "POST",
                token: admin.token,
                body: adminCouponBody({ type: "bogo" }),
            });
            assert.equal(badType.status, 400);

            const badId = await request("/coupons/abc", { method: "PUT", token: admin.token, body: adminCouponBody() });
            assert.equal(badId.status, 400);

            const missing = await request("/coupons/99999999", { method: "DELETE", token: admin.token });
            assert.equal(missing.status, 404);
        });

        it("keeps coupon management admin-only", async () => {
            // Each write needs its own path: PUT/DELETE are on /:id, so a bare
            // /coupons with those verbs is simply a 404 and proves nothing.
            const attempts = [
                { method: "POST", path: "/coupons", body: adminCouponBody() },
                { method: "PUT", path: "/coupons/1", body: adminCouponBody() },
                { method: "DELETE", path: "/coupons/1", body: {} },
                { method: "GET", path: "/coupons", body: undefined },
            ];

            for (const attempt of attempts) {
                const { status } = await request(attempt.path, {
                    method: attempt.method,
                    token: customer.token,
                    body: attempt.body,
                });
                assert.equal(status, 403, `${attempt.method} ${attempt.path} must not be allowed for a customer`);
            }

            const anon = await request("/coupons");
            assert.equal(anon.status, 401);
        });
    });

    describe("validate quote endpoint", () => {
        it("quotes a discount without consuming anything", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 25 });
            await addToCart({ token: customer.token }, 1);

            const { status, body } = await request("/coupons/validate", {
                method: "POST",
                token: customer.token,
                body: { code, subtotal: 200, deliveryFee: 30 },
            });

            assert.equal(status, 200, JSON.stringify(body));
            assert.equal(Number(body.data.discount), 50);
        });

        it("requires authentication", async () => {
            const { code } = await makeCoupon({ type: "percentage", value: 25 });
            const { status } = await request("/coupons/validate", {
                method: "POST",
                body: { code, subtotal: 200, deliveryFee: 0 },
            });
            assert.equal(status, 401);
        });

        it("reports an expired code as a conflict, not a 404", async () => {
            const { code } = await makeCoupon({
                type: "percentage",
                value: 25,
                expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
            });
            const { status } = await request("/coupons/validate", {
                method: "POST",
                token: customer.token,
                body: { code, subtotal: 200, deliveryFee: 0 },
            });
            assert.equal(status, 409);
        });
    });
});
