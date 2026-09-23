import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { finishSuite, login, request, seedAdmin, signupUser, startSuite, trackOrder, uniquePhone } from "./helpers.js";

before(startSuite);
after(finishSuite);

describe("orders", () => {
    let admin: { token: string };
    let customer: { token: string; user: { id: number; phone: string } };

    before(async () => {
        const adminFixture = await seedAdmin();
        const adminLogin = await login(adminFixture.email, adminFixture.password);
        assert.equal(adminLogin.status, 200);
        admin = { token: adminLogin.body.data.token };

        const customerFixture = await signupUser();
        assert.equal(customerFixture.user.role, "customer");
        customer = { token: customerFixture.token, user: customerFixture.user };
    });

    const placeOrder = async (body: Record<string, unknown>, token?: string) => {
        const result = await request("/orders", {
            method: "POST",
            token,
            body: {
                branchID: 1,
                customerName: "Suite Tester",
                customerPhone: customer.user.phone,
                items: [{ productID: 1, quantity: 1 }],
                ...body,
            },
        });
        if (result.body.data?.id) trackOrder(result.body.data.id);
        return { status: result.status, order: result.body.data };
    };

    it("rejects unauthenticated access to every admin order endpoint", async () => {
        for (const path of ["/orders", "/orders/stats", "/orders/count", "/orders/my", "/orders/1"]) {
            const { status } = await request(path);
            assert.equal(status, 401, `expected 401 for GET ${path}`);
        }
    });

    it("keeps order creation public", async () => {
        const { status } = await placeOrder({});
        assert.equal(status, 201);
    });

    it("validates order input with 400 instead of crashing", async () => {
        const badPayloads = [
            { customerPhone: "not-a-phone" },
            { branchID: "abc" },
            { items: [] },
            { items: [{ productID: 1, quantity: 1.5 }] },
            { items: [{ productID: "x", quantity: 1 }] },
            { items: [{ productID: 1, quantity: 0 }] },
        ];
        for (const body of badPayloads) {
            const { status } = await placeOrder(body);
            assert.equal(status, 400, `expected 400 for ${JSON.stringify(body)}`);
        }
    });

    it("normalizes international Egyptian phone formats on creation", async () => {
        const { status, order } = await placeOrder({ customerPhone: "+20 100 555 2233" });
        assert.equal(status, 201);
        assert.equal(order.customer_phone, "01005552233");
    });

    it("lets a customer see only their own orders via /orders/my", async () => {
        const mine = await placeOrder({});
        assert.equal(mine.status, 201);

        const someoneElse = await placeOrder({ customerPhone: uniquePhone() });
        assert.equal(someoneElse.status, 201);

        const { status, body } = await request("/orders/my", { token: customer.token });
        assert.equal(status, 200);
        const data: Array<{ id: number }> = body.data ?? [];
        const ids = data.map((order) => order.id);
        assert.ok(ids.includes(mine.order.id), "own order should be listed");
        assert.ok(!ids.includes(someoneElse.order.id), "someone else's order must not leak");
    });

    it("prevents a customer from listing or mutating all orders", async () => {
        const list = await request("/orders", { token: customer.token });
        assert.equal(list.status, 403);

        const detail = await request("/orders/1", { token: customer.token });
        assert.equal(detail.status, 403);

        const stats = await request("/orders/stats", { token: customer.token });
        assert.equal(stats.status, 403);
    });

    it("lets an admin list orders and rejects malformed filters", async () => {
        const ok = await request("/orders", { token: admin.token });
        assert.equal(ok.status, 200);
        assert.ok(Array.isArray(ok.body.data));

        const badFilters = ["status=Bogus", "branchId=abc", "customerPhone=%20%20"];
        for (const query of badFilters) {
            const { status } = await request(`/orders?${query}`, { token: admin.token });
            assert.equal(status, 400, `expected 400 for ?${query}`);
        }
    });

    it("enforces admin-only status transitions", async () => {
        const { status, order } = await placeOrder({});
        assert.equal(status, 201);

        const forbidden = await request(`/orders/${order.id}/status`, {
            method: "PATCH",
            token: customer.token,
            body: { status: "Cancelled" },
        });
        assert.equal(forbidden.status, 403);

        const forward = await request(`/orders/${order.id}/status`, {
            method: "PATCH",
            token: admin.token,
            body: { status: "On the way" },
        });
        assert.equal(forward.status, 200);

        // Backwards transitions are rejected by the service.
        const backward = await request(`/orders/${order.id}/status`, {
            method: "PATCH",
            token: admin.token,
            body: { status: "Preparing" },
        });
        assert.equal(backward.status, 400);
    });
});