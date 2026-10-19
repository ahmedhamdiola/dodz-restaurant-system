import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { finishSuite, login, request, seedAdmin, signupUser, startSuite, trackOrder, trackProduct, uniqueGuestToken } from "./helpers.js";
import { pool } from "../src/config/database.js";

before(startSuite);
after(finishSuite);

describe("stock at checkout", () => {
    let adminToken: string;
    let customerToken: string;
    let branchId: number;
    let productId: number;

    before(async () => {
        const adminFixture = await seedAdmin();
        const adminLogin = await login(adminFixture.email, adminFixture.password);
        assert.equal(adminLogin.status, 200);
        adminToken = adminLogin.body.data.token;

        const customer = await signupUser();
        customerToken = customer.token;

        branchId = (await pool.query(`SELECT id FROM branches WHERE is_deleted = false ORDER BY id LIMIT 1`)).rows[0].id;
        const categoryId = (await pool.query(`SELECT id FROM categories WHERE is_deleted = false ORDER BY id LIMIT 1`)).rows[0].id;

        const created = await request("/products", {
            method: "POST",
            token: adminToken,
            body: {
                name: `Stock Suite Product ${Date.now().toString(36)}`,
                description: "created by the stock-checkout suite",
                price: 10,
                image: "https://example.test/stock-suite.jpg",
                categoryID: categoryId,
            },
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        productId = created.body.data.id;
        trackProduct(productId);
    });

    const setStock = async (quantity: number) => {
        const res = await request(`/stock/branch/${branchId}/product/${productId}`, {
            method: "PUT",
            token: adminToken,
            body: { quantity },
        });
        assert.equal(res.status, 200, JSON.stringify(res.body));
    };

    const stockOf = async () => {
        const res = await request(`/stock/branch/${branchId}`, { token: adminToken });
        assert.equal(res.status, 200);
        const item = res.body.data.find((row: { id: number }) => row.id === productId);
        assert.ok(item, "the product must appear in the branch menu");
        return item.quantity as number;
    };

    const emptyCart = async () => {
        await request("/cart", { method: "DELETE", token: customerToken });
    };

    const addToCart = async (quantity: number) => {
        const res = await request("/cart/items", {
            method: "POST",
            token: customerToken,
            body: { productID: productId, quantity },
        });
        assert.ok([200, 201].includes(res.status), JSON.stringify(res.body));
    };

    const checkout = (idempotencyKey = uniqueGuestToken()) =>
        request("/cart/checkout", {
            method: "POST",
            token: customerToken,
            body: {
                branchID: branchId,
                customerName: "Stock Suite Tester",
                orderType: "Pickup",
                idempotencyKey,
            },
        });

    const availability = (ids: number[], branch = branchId, token?: string) =>
        request(`/stock/branch/${branch}/available?productIds=${ids.join(",")}`, { token });

    it("deducts the ordered units from the branch", async () => {
        await emptyCart();
        await setStock(10);
        await addToCart(3);

        const res = await checkout();
        assert.equal(res.status, 201, JSON.stringify(res.body));
        trackOrder(res.body.data.id);

        assert.equal(await stockOf(), 7);
        const cart = await request("/cart", { token: customerToken });
        assert.equal(cart.body.data.items.length, 0, "a successful checkout empties the cart");
    });

    it("refuses a cart that asks for more than the branch holds", async () => {
        await emptyCart();
        await setStock(2);
        await addToCart(3);

        const res = await checkout();
        assert.equal(res.status, 409, JSON.stringify(res.body));
        assert.equal(res.body.data?.type, "INSUFFICIENT_STOCK");
        assert.match(res.body.message ?? "", /only 2 left/);
        assert.deepEqual(res.body.data?.unavailableProductIds, [productId]);
        assert.ok((res.body.data?.unavailableCartItemIds ?? []).length > 0);

        assert.equal(await stockOf(), 2, "a rejected order must not move stock");
        const cart = await request("/cart", { token: customerToken });
        assert.equal(cart.body.data.item_count, 3, "the cart survives so the customer can fix it");
    });

    it("names an item that is fully out of stock", async () => {
        await emptyCart();
        await setStock(0);
        await addToCart(1);

        const res = await checkout();
        assert.equal(res.status, 409, JSON.stringify(res.body));
        assert.match(res.body.message ?? "", /out of stock/);
        assert.equal(await stockOf(), 0);
    });

    it("does not deduct twice when the same checkout key is replayed", async () => {
        await emptyCart();
        await setStock(5);
        await addToCart(2);
        const key = uniqueGuestToken();

        const first = await checkout(key);
        assert.equal(first.status, 201, JSON.stringify(first.body));
        trackOrder(first.body.data.id);

        const replay = await checkout(key);
        assert.equal(replay.status, 201, JSON.stringify(replay.body));
        assert.equal(replay.body.data.id, first.body.data.id, "the replay returns the original order");
        assert.equal(await stockOf(), 3, "the replay must not spend stock again");
    });

    it("reports per-product availability without leaking counts", async () => {
        await setStock(1);
        const inStock = await availability([productId]);
        assert.equal(inStock.status, 200);
        assert.deepEqual(inStock.body.data[0], { productId, available: true });

        await setStock(0);
        const gone = await availability([productId]);
        assert.equal(gone.body.data[0].available, false);
        assert.equal(gone.body.data[0].quantity, undefined, "exact counts stay server-side");

        assert.equal((await availability([productId], 999999)).status, 404);
        assert.equal((await request(`/stock/branch/${branchId}/available`)).status, 400);
    });

    it("restores stock when an order is cancelled, exactly once", async () => {
        await emptyCart();
        await setStock(5);
        await addToCart(2);

        const placed = await checkout();
        assert.equal(placed.status, 201, JSON.stringify(placed.body));
        const orderId = placed.body.data.id as number;
        trackOrder(orderId);
        assert.equal(await stockOf(), 3);

        const cancelled = await request(`/orders/${orderId}/status`, {
            method: "PATCH",
            token: adminToken,
            body: { status: "Cancelled" },
        });
        assert.equal(cancelled.status, 200, JSON.stringify(cancelled.body));
        assert.equal(await stockOf(), 5);

        const again = await request(`/orders/${orderId}/status`, {
            method: "PATCH",
            token: adminToken,
            body: { status: "Cancelled" },
        });
        assert.equal(again.status, 200);
        assert.equal(await stockOf(), 5, "a repeated cancel must not inflate stock");
    });

    it("applies the same rules to manual orders created from the dashboard", async () => {
        await setStock(4);
        const placed = await request("/orders", {
            method: "POST",
            body: {
                branchID: branchId,
                customerName: "Stock Suite Manual",
                items: [{ productID: productId, quantity: 3 }],
            },
        });
        assert.equal(placed.status, 201, JSON.stringify(placed.body));
        trackOrder(placed.body.data.id);
        assert.equal(await stockOf(), 1);

        const tooMany = await request("/orders", {
            method: "POST",
            body: {
                branchID: branchId,
                customerName: "Stock Suite Manual",
                items: [{ productID: productId, quantity: 2 }],
            },
        });
        assert.equal(tooMany.status, 409, JSON.stringify(tooMany.body));
        assert.match(tooMany.body.message ?? "", /only 1 left/);
        assert.equal(await stockOf(), 1);
    });
});
