import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
    finishSuite,
    request,
    signupUser,
    startSuite,
    trackGuestToken,
    trackOrder,
    uniqueGuestToken,
    uniquePhone,
} from "./helpers.js";
import { pool } from "../src/config/database.js";

before(startSuite);
after(finishSuite);

describe("cart", () => {
    let availableProductId: number;
    let unavailableProductId: number;
    let modifierProductId: number;
    let productPrice: number;
    let productCount: number;

    before(async () => {
        // Exclude modifier products (never orderable) AND anything with an option
        // tree (a required group would make a bare add-to-cart invalid - that is
        // covered by the options suite instead).
        const result = await pool.query(
            `SELECT p.id, p.price FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.is_deleted = false AND p.is_available = true AND p.is_modifier = false
               AND c.is_deleted = false
               AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id)
             ORDER BY p.id LIMIT 5`
        );
        assert.ok(result.rows.length > 0, "seed data must include available products");
        availableProductId = result.rows[0].id;
        productPrice = Number(result.rows[0].price);

        const count = await pool.query(
            `SELECT COUNT(*)::int AS count FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.is_deleted = false AND p.is_available = true AND p.is_modifier = false
               AND c.is_deleted = false
               AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id)`
        );
        productCount = count.rows[0].count;

        const unavailable = await pool.query(
            `SELECT id FROM products
             WHERE is_available = false AND is_deleted = false AND is_modifier = false
               AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id)
             LIMIT 1`
        );
        unavailableProductId = unavailable.rows[0]?.id ?? -1;

        const modifier = await pool.query(
            `SELECT id FROM products WHERE is_modifier = true AND is_deleted = false LIMIT 1`
        );
        modifierProductId = modifier.rows[0]?.id ?? -1;
    });

    const guestHeaders = (token: string) => ({ guestToken: token });
    const newGuest = () => {
        const token = uniqueGuestToken();
        trackGuestToken(token);
        return token;
    };

    describe("guest cart", () => {
        it("returns an empty cart for a visitor without a token", async () => {
            const { status, body } = await request("/cart");
            assert.equal(status, 200);
            assert.deepEqual(body.data.items, []);
            assert.equal(body.data.subtotal, 0);
        });

        it("requires an identity to mutate the cart", async () => {
            for (const [method, path, body] of [
                ["POST", "/cart/items", { productID: availableProductId, quantity: 1 }],
                ["DELETE", "/cart", {}],
            ] as const) {
                const { status } = await request(path, { method, body });
                assert.equal(status, 400, `expected 400 for ${method} ${path}`);
            }
        });

        it("rejects malformed guest tokens", async () => {
            const { status } = await request("/cart/items", {
                method: "POST",
                guestToken: "short",
                body: { productID: availableProductId },
            });
            assert.equal(status, 400);
        });

        it("adds items and increments quantities capped at 99", async () => {
            const guest = newGuest();
            const add = await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 1 },
            });
            assert.equal(add.status, 201);
            assert.equal(add.body.data.items.length, 1);
            assert.equal(add.body.data.item_count, 1);
            assert.equal(add.body.data.subtotal, productPrice);

            const again = await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 99 },
            });
            assert.equal(again.status, 201);
            assert.equal(again.body.data.item_count, 99, "adds must clamp at MAX_QUANTITY");
        });

        it("rejects invalid products and quantities with 400", async () => {
            const guest = newGuest();
            const cases = [
                { body: { productID: 999999999, quantity: 1 } },
                { body: { productID: availableProductId, quantity: 0 } },
                { body: { productID: availableProductId, quantity: 100 } },
                { body: { productID: availableProductId, quantity: "x" } },
                { body: { productID: "abc", quantity: 1 } },
            ];
            for (const c of cases) {
                const { status } = await request("/cart/items", {
                    method: "POST",
                    ...guestHeaders(guest),
                    body: c.body,
                });
                assert.equal(status, 400, `expected 400 for ${JSON.stringify(c.body)}`);
            }
        });

        it("sets exact quantities via PUT and removes lines idempotently", async () => {
            const guest = newGuest();
            const add = await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 2 },
            });
            assert.equal(add.status, 201);
            // Lines are addressed by cart_items.id, not by product id.
            const cartItemId: number = add.body.data.items[0].id;
            assert.equal(typeof cartItemId, "number");
            assert.notEqual(cartItemId, availableProductId);
            assert.equal(add.body.data.items[0].options_signature, "");

            const put = await request(`/cart/items/${cartItemId}`, {
                method: "PUT",
                ...guestHeaders(guest),
                body: { quantity: 5 },
            });
            assert.equal(put.status, 200);
            assert.equal(put.body.data.items[0].quantity, 5);

            const badPut = await request(`/cart/items/${cartItemId}`, {
                method: "PUT",
                ...guestHeaders(guest),
                body: { quantity: 0 },
            });
            assert.equal(badPut.status, 400);

            const del = await request(`/cart/items/${cartItemId}`, {
                method: "DELETE",
                ...guestHeaders(guest),
            });
            assert.equal(del.status, 200);
            assert.equal(del.body.data.items.length, 0);

            const delAgain = await request(`/cart/items/${cartItemId}`, {
                method: "DELETE",
                ...guestHeaders(guest),
            });
            assert.equal(delAgain.status, 200, "removing a line twice is a no-op");
        });

        it("rejects updates for lines not in the cart", async () => {
            const guest = newGuest();
            const { status } = await request(`/cart/items/${availableProductId}`, {
                method: "PUT",
                ...guestHeaders(guest),
                body: { quantity: 3 },
            });
            assert.equal(status, 404, "a product id is not a cart item id");
        });

        it("never orders a hidden modifier product", async () => {
            if (modifierProductId === -1) return;
            const guest = newGuest();
            const { status, body } = await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: modifierProductId, quantity: 1 },
            });
            assert.equal(status, 409);
            assert.equal(body.data.type, "UNAVAILABLE_PRODUCT");
            assert.deepEqual(body.data.unavailableProductIds, [modifierProductId]);
        });

        it("enforces the distinct-item cap", async () => {
            if (productCount < 50) {
                return; // seed data is too small to fill a cart to the cap
            }
            const guest = newGuest();
            const top = await pool.query(
                `SELECT id FROM products
                 WHERE is_deleted = false AND is_available = true AND is_modifier = false
                   AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id)
                 ORDER BY id LIMIT 50`
            );
            for (const p of top.rows.slice(0, 49)) {
                await request("/cart/items", {
                    method: "POST",
                    ...guestHeaders(guest),
                    body: { productID: p.id, quantity: 1 },
                });
            }
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: top.rows[49].id, quantity: 1 },
            });
            const full = await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: top.rows[0].id, quantity: 1 },
            });
            assert.equal(full.status, 201, "re-adding an existing product is allowed past the cap");

            const extra = await pool.query(
                `SELECT id FROM products
                 WHERE is_deleted = false AND is_available = true AND is_modifier = false
                   AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id)
                   AND id <> ALL($1::int[])
                 ORDER BY id LIMIT 1`,
                [top.rows.map((p: { id: number }) => p.id)]
            );
            if (extra.rows[0]) {
                const overflow = await request("/cart/items", {
                    method: "POST",
                    ...guestHeaders(guest),
                    body: { productID: extra.rows[0].id, quantity: 1 },
                });
                assert.equal(overflow.status, 400, "a 51st distinct item must be rejected");
            }
        });

        it("clears the whole cart", async () => {
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 1 },
            });
            const { status, body } = await request("/cart", { method: "DELETE", ...guestHeaders(guest) });
            assert.equal(status, 200);
            assert.deepEqual(body.data.items, []);
        });
    });

    describe("account cart", () => {
        it("keeps separate carts across accounts and guests", async () => {
            const customer = await signupUser();
            const guest = newGuest();

            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 1 },
            });
            const own = await request("/cart/items", {
                method: "POST",
                token: customer.token,
                body: { productID: availableProductId, quantity: 1 },
            });
            assert.equal(own.status, 201);

            const guestCart = await request("/cart", { ...guestHeaders(guest) });
            const accountCart = await request("/cart", { token: customer.token });
            assert.equal(guestCart.body.data.item_count, 1);
            assert.equal(accountCart.body.data.item_count, 1);
        });

        it("merges a guest cart on login, deduping and deleting the guest cart", async () => {
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 2 },
            });

            const customer = await signupUser();
            const merge = await request("/cart/merge", {
                method: "POST",
                token: customer.token,
                body: { guestToken: guest },
            });
            assert.equal(merge.status, 200);
            assert.equal(merge.body.data.item_count, 2, "guest items should land in the account cart");

            const accountAfter = await request("/cart", { token: customer.token });
            assert.equal(accountAfter.body.data.item_count, 2);

            const guestAfter = await request("/cart", { ...guestHeaders(guest) });
            assert.equal(guestAfter.body.data.items.length, 0, "guest cart must be consumed by the merge");

            // Merging the same token again is a harmless no-op.
            const repeat = await request("/cart/merge", {
                method: "POST",
                token: customer.token,
                body: { guestToken: guest },
            });
            assert.equal(repeat.status, 200);
        });

        it("rejects merges without a valid token or auth", async () => {
            const noToken = await request("/cart/merge", { method: "POST", body: { guestToken: "abcd" } });
            assert.equal(noToken.status, 401);

            const customer = await signupUser();
            const bad = await request("/cart/merge", {
                method: "POST",
                token: customer.token,
                body: { guestToken: "too-short" },
            });
            assert.equal(bad.status, 400);

            const missing = await request("/cart/merge", { method: "POST", token: customer.token, body: {} });
            assert.equal(missing.status, 400);
        });
    });

    describe("checkout", () => {
        const guestCheckout = (guest: string, body: Record<string, unknown>) =>
            request("/cart/checkout", { method: "POST", ...guestHeaders(guest), body });

        it("places an order from the cart, clears it, and is idempotent", async () => {
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 2 },
            });

            const phone = uniquePhone();
            const key = uniqueGuestToken();
            const checkout = await guestCheckout(guest, {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: phone,
                idempotencyKey: key,
            });
            assert.equal(checkout.status, 201);
            assert.equal(checkout.body.data.branch_id, 1);
            assert.equal(checkout.body.data.total, productPrice * 2);
            assert.equal(checkout.body.data.customer_phone, phone);
            assert.equal(checkout.body.data.status, "Preparing");
            if (checkout.body.data.id) trackOrder(checkout.body.data.id);

            const after = await request("/cart", { ...guestHeaders(guest) });
            assert.equal(after.body.data.items.length, 0, "checkout must empty the cart");

            const replay = await guestCheckout(guest, {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: phone,
                idempotencyKey: key,
            });
            assert.equal(replay.status, 201);
            assert.equal(replay.body.data.id, checkout.body.data.id, "retry returns the original order");
        });

        it("rejects checkout on an empty cart", async () => {
            const guest = newGuest();
            const { status } = await guestCheckout(guest, {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: uniquePhone(),
                idempotencyKey: uniqueGuestToken(),
            });
            assert.equal(status, 400);
        });

        it("returns 409 with the unavailable product ids", async () => {
            if (unavailableProductId === -1) return; // no seeded unavailable product to test against
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: unavailableProductId, quantity: 1 },
            });
            const { status, body } = await guestCheckout(guest, {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: uniquePhone(),
                idempotencyKey: uniqueGuestToken(),
            });
            assert.equal(status, 409);
            assert.deepEqual(body.data.unavailableProductIds, [unavailableProductId]);
        });

        it("rejects a guessable or overlong idempotency key", async () => {
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 1 },
            });
            const base = { branchID: 1, customerName: "Suite Tester", customerPhone: uniquePhone() };

            // The replay lookup is keyed by this string alone, so a short or
            // predictable key would let anyone read back someone else's order.
            const short = await guestCheckout(guest, { ...base, idempotencyKey: "order-1" });
            assert.equal(short.status, 400);
            assert.match(String(short.body.message), /idempotency/i);

            // orders.idempotency_key is VARCHAR(64): a key that passed validation but
            // did not fit the column would fail inside Postgres as a 500.
            const tooLong = await guestCheckout(guest, { ...base, idempotencyKey: "a".repeat(65) });
            assert.equal(tooLong.status, 400, JSON.stringify(tooLong.body));

            const nonString = await guestCheckout(guest, { ...base, idempotencyKey: 12345 });
            assert.equal(nonString.status, 400);

            // A 64-character key is exactly the column width and must be accepted.
            const atLimit = await guestCheckout(guest, { ...base, idempotencyKey: "b".repeat(64) });
            assert.equal(atLimit.status, 201, JSON.stringify(atLimit.body));
            if (atLimit.body.data.id) trackOrder(atLimit.body.data.id);
        });

        it("rejects invalid branches and missing names", async () => {
            const guest = newGuest();
            await request("/cart/items", {
                method: "POST",
                ...guestHeaders(guest),
                body: { productID: availableProductId, quantity: 1 },
            });

            const badBranch = await guestCheckout(guest, {
                branchID: 999999,
                customerName: "Suite Tester",
                customerPhone: uniquePhone(),
            });
            assert.equal(badBranch.status, 400);

            const noName = await guestCheckout(guest, {
                branchID: 1,
                customerPhone: uniquePhone(),
            });
            assert.equal(noName.status, 400);

            const badPhone = await guestCheckout(guest, {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: "not-a-phone",
            });
            assert.equal(badPhone.status, 400);
        });

        it("defaults a signed-in user's checkout details to their account", async () => {
            const customer = await signupUser();
            await request("/cart/items", {
                method: "POST",
                token: customer.token,
                body: { productID: availableProductId, quantity: 1 },
            });

            const { status, body } = await request("/cart/checkout", {
                method: "POST",
                token: customer.token,
                body: {
                    branchID: 1,
                    idempotencyKey: uniqueGuestToken(),
                },
            });
            assert.equal(status, 201);
            assert.equal(body.data.customer_name, customer.user.name);
            assert.equal(body.data.customer_phone, customer.user.phone);
            if (body.data.id) trackOrder(body.data.id);

            const mine = await request("/orders/my", { token: customer.token });
            assert.ok(
                mine.body.data.some((order: { id: number }) => order.id === body.data.id),
                "the checkout order should appear in the customer's order history"
            );
        });
    });
});