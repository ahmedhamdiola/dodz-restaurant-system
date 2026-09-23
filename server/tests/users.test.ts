import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { finishSuite, login, request, seedAdmin, signupUser, startSuite } from "./helpers.js";

before(startSuite);
after(finishSuite);

describe("users", () => {
    let admin: { token: string; id: number };
    let customer: { token: string; user: { id: number; email: string } };
    let otherCustomer: { token: string; user: { id: number } };

    before(async () => {
        const adminFixture = await seedAdmin();
        const adminLogin = await login(adminFixture.email, adminFixture.password);
        assert.equal(adminLogin.status, 200);
        admin = { token: adminLogin.body.data.token, id: adminLogin.body.data.user.id };

        const customerFixture = await signupUser();
        const otherFixture = await signupUser();
        customer = { token: customerFixture.token, user: customerFixture.user };
        otherCustomer = { token: otherFixture.token, user: otherFixture.user };
    });

    it("rejects unauthenticated access to user endpoints", async () => {
        for (const path of ["/users", "/users/1", `/users/email/${customer.user.id}`]) {
            const { status } = await request(path);
            assert.equal(status, 401, `expected 401 for GET ${path}`);
        }
        const mutate = await request("/users", { method: "POST", body: {} });
        assert.equal(mutate.status, 401);
    });

    it("lets a customer fetch their own record but nobody else's", async () => {
        const mine = await request(`/users/${customer.user.id}`, { token: customer.token });
        assert.equal(mine.status, 200);
        assert.equal(mine.body.data.email, customer.user.email);

        const someoneElse = await request(`/users/${otherCustomer.user.id}`, { token: customer.token });
        assert.equal(someoneElse.status, 403);

        const byEmail = await request(`/users/email/${customer.user.email}`, { token: customer.token });
        assert.equal(byEmail.status, 403);
    });

    it("blocks a customer from listing users", async () => {
        const { status } = await request("/users", { token: customer.token });
        assert.equal(status, 403);
    });

    it("blocks a customer from changing their own role", async () => {
        const attempt = await request(`/users/${customer.user.id}`, {
            method: "PUT",
            token: customer.token,
            body: { role: "admin" },
        });
        assert.equal(attempt.status, 403);
        assert.equal(attempt.body.message, "You cannot change your own role");
    });

    it("rejects invalid roles regardless of privilege", async () => {
        const attempt = await request(`/users/${otherCustomer.user.id}`, {
            method: "PUT",
            token: admin.token,
            body: { role: "superuser" },
        });
        assert.equal(attempt.status, 400);
    });

    it("lets an admin list users and read any user", async () => {
        const list = await request("/users", { token: admin.token });
        assert.equal(list.status, 200);
        assert.ok(Array.isArray(list.body.data));
        assert.ok(list.body.data.some((u: { id: number }) => u.id === customer.user.id));

        const byId = await request(`/users/${customer.user.id}`, { token: admin.token });
        assert.equal(byId.status, 200);

        const byEmail = await request(`/users/email/${customer.user.email}`, { token: admin.token });
        assert.equal(byEmail.status, 200);
    });

    it("lets an admin promote a user", async () => {
        const promote = await request(`/users/${otherCustomer.user.id}`, {
            method: "PUT",
            token: admin.token,
            body: { role: "staff" },
        });
        assert.equal(promote.status, 200);
        assert.equal(promote.body.data.role, "staff");
    });

    it("prevents an admin from demoting or deleting their own account", async () => {
        const demote = await request(`/users/${admin.id}`, {
            method: "PUT",
            token: admin.token,
            body: { role: "customer" },
        });
        assert.equal(demote.status, 400);
        assert.equal(demote.body.message, "You cannot demote your own account");

        const remove = await request(`/users/${admin.id}`, { method: "DELETE", token: admin.token });
        assert.equal(remove.status, 400);
        assert.equal(remove.body.message, "You cannot delete your own account");
    });
});