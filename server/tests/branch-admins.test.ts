import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
    finishSuite,
    login,
    request,
    seedAdmin,
    signupUser,
    startSuite,
    trackAlert,
    trackProduct,
    trackUser,
    uniqueEmail,
    uniquePhone,
} from "./helpers.js";
import { pool } from "../src/config/database.js";

before(startSuite);
after(finishSuite);

describe("branch admins", () => {
    // [0] is the branch our branch admin is assigned to, [1] is the intruder target.
    let ownBranchId: number;
    let otherBranchId: number;
    let seededProductId: number;
    let productId: number;
    let admin: { id: number; token: string };
    let branchAdmin: { id: number; token: string; email: string; password: string };
    let customer: { token: string };

    const getStock = (token: string, branchId = ownBranchId) => request(`/stock/branch/${branchId}`, { token });
    const setStock = (token: string, body: Record<string, unknown>, branchId = ownBranchId, id = productId) =>
        request(`/stock/branch/${branchId}/product/${id}`, { method: "PUT", token, body });
    const sendAlert = (token: string, body: Record<string, unknown>) =>
        request("/alerts", { method: "POST", token, body });
    const listAlerts = (token: string, query = "") => request(`/alerts${query}`, { token });

    before(async () => {
        const branches = await pool.query(`SELECT id FROM branches WHERE is_deleted = false ORDER BY id LIMIT 2`);
        assert.ok(branches.rows.length >= 2, "seed data must include at least two branches");
        ownBranchId = branches.rows[0].id;
        otherBranchId = branches.rows[1].id;

        const seeded = await pool.query(
            `SELECT p.id FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.is_deleted = false AND p.is_modifier = false AND c.is_deleted = false
             ORDER BY p.id LIMIT 1`
        );
        assert.ok(seeded.rows.length > 0, "seed data must include products");
        seededProductId = seeded.rows[0].id;

        const category = await pool.query(`SELECT id FROM categories WHERE is_deleted = false ORDER BY id LIMIT 1`);
        assert.ok(category.rows.length > 0, "seed data must include categories");

        const adminFixture = await seedAdmin();
        const adminLogin = await login(adminFixture.email, adminFixture.password);
        assert.equal(adminLogin.status, 200);
        admin = { id: adminFixture.id, token: adminLogin.body.data.token };

        customer = await signupUser();

        // A branch admin, minted through the admin API (covers the new role +
        // branch assignment + password path in one go).
        const email = uniqueEmail("branchadmin");
        const password = "BranchAdminPass!123";
        const created = await request("/users", {
            method: "POST",
            token: admin.token,
            body: {
                name: "Suite Branch Admin",
                email,
                phone: uniquePhone(),
                role: "branch_admin",
                branchId: ownBranchId,
                password,
                isEmailVerified: true,
            },
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        trackUser(created.body.data.id);
        const branchLogin = await login(email, password);
        assert.equal(branchLogin.status, 200);
        branchAdmin = { id: created.body.data.id, token: branchLogin.body.data.token, email, password };

        // A product created through the API: also proves new products get their
        // per-branch stock rows seeded.
        const product = await request("/products", {
            method: "POST",
            token: admin.token,
            body: {
                name: `Suite Stock Product ${Date.now().toString(36)}`,
                description: "Created by the branch-admin suite",
                price: 25,
                image: "https://example.com/suite-stock-product.jpg",
                categoryID: category.rows[0].id,
            },
        });
        assert.equal(product.status, 201, JSON.stringify(product.body));
        productId = product.body.data.id;
        trackProduct(productId);
    });

    describe("branch scoping of stock", () => {
        it("lets a main admin read any branch's menu and counts", async () => {
            const res = await getStock(admin.token, otherBranchId);
            assert.equal(res.status, 200);
            const items: Array<{ id: number; quantity: number; lowStockThreshold: number; categoryName: string }> = res.body.data;
            assert.ok(Array.isArray(items) && items.length > 0);
            const seededItem = items.find((item) => item.id === seededProductId);
            assert.ok(seededItem, "the seeded product must appear in the branch menu");
            assert.equal(typeof seededItem!.quantity, "number");
            assert.ok(seededItem!.lowStockThreshold >= 0);
            assert.ok(seededItem!.categoryName);
        });

        it("seeds 50 units for a newly created product on every branch", async () => {
            const res = await getStock(admin.token);
            assert.equal(res.status, 200);
            const item = res.body.data.find((entry: { id: number }) => entry.id === productId);
            assert.ok(item, "a newly created product must appear on the branch menu");
            assert.equal(item.quantity, 50);
            assert.equal(item.lowStockThreshold, 10);
        });

        it("lets a branch admin read and edit their own branch", async () => {
            const read = await getStock(branchAdmin.token);
            assert.equal(read.status, 200);

            const updated = await setStock(branchAdmin.token, { quantity: 7 });
            assert.equal(updated.status, 200);
            assert.equal(updated.body.data.quantity, 7);
            // Threshold omitted on a quick edit: the existing value is kept.
            assert.equal(updated.body.data.low_stock_threshold, 10);

            const after = await getStock(branchAdmin.token);
            const item = after.body.data.find((entry: { id: number }) => entry.id === productId);
            assert.equal(item.quantity, 7);
            assert.equal(item.lowStockThreshold, 10);
        });

        it("keeps an explicit low-stock threshold", async () => {
            const res = await setStock(branchAdmin.token, { quantity: 4, lowStockThreshold: 3 });
            assert.equal(res.status, 200);
            assert.equal(res.body.data.low_stock_threshold, 3);

            const after = await getStock(branchAdmin.token);
            const item = after.body.data.find((entry: { id: number }) => entry.id === productId);
            assert.equal(item.lowStockThreshold, 3);
        });

        it("does not touch another branch's counts", async () => {
            const res = await getStock(admin.token, otherBranchId);
            const item = res.body.data.find((entry: { id: number }) => entry.id === productId);
            assert.equal(item.quantity, 50, "editing one branch must not change the others");
        });

        it("forbids a branch admin from another branch's stock", async () => {
            const read = await getStock(branchAdmin.token, otherBranchId);
            assert.equal(read.status, 403);
            const write = await setStock(branchAdmin.token, { quantity: 5 }, otherBranchId);
            assert.equal(write.status, 403);
        });

        it("forbids customers and staff from stock", async () => {
            assert.equal((await getStock(customer.token)).status, 403);
            assert.equal((await setStock(customer.token, { quantity: 5 })).status, 403);
            assert.equal((await getStock("not-a-token")).status, 401);
        });

        it("hides branch existence from callers without access", async () => {
            // A customer probing an unknown branch gets the same 403 as a real
            // one, so they cannot enumerate branch ids.
            const res = await request("/stock/branch/999999", { token: customer.token });
            assert.equal(res.status, 403);
        });

        it("validates the stock payload", async () => {
            assert.equal((await setStock(admin.token, { quantity: -1 })).status, 400);
            assert.equal((await setStock(admin.token, { quantity: 1, lowStockThreshold: -1 })).status, 400);
            assert.equal((await getStock(admin.token, 999999)).status, 404);
            const missingProduct = await request(`/stock/branch/${ownBranchId}/product/999999`, {
                method: "PUT",
                token: admin.token,
                body: { quantity: 1 },
            });
            assert.equal(missingProduct.status, 404);
        });
    });

    describe("branch alerts", () => {
        let alertId: number;

        it("takes the branch from the sender's account, not the request body", async () => {
            const res = await sendAlert(branchAdmin.token, {
                type: "needs_stock",
                message: "Down to the last bag of wings",
                branchId: otherBranchId, // should be ignored
            });
            assert.equal(res.status, 201, JSON.stringify(res.body));
            assert.ok(res.body.data.id);
            trackAlert(res.body.data.id);
            alertId = res.body.data.id;
            assert.equal(res.body.data.branchId, ownBranchId);
            assert.equal(res.body.data.senderId, branchAdmin.id);
            assert.equal(res.body.data.status, "pending");
            assert.ok(res.body.data.branchName);
        });

        it("only branch admins may send", async () => {
            assert.equal((await sendAlert(admin.token, { type: "other", message: "hi" })).status, 403);
            assert.equal((await sendAlert(customer.token, { type: "other", message: "hi" })).status, 403);
        });

        it("validates type and message", async () => {
            assert.equal((await sendAlert(branchAdmin.token, { type: "hangry", message: "x" })).status, 400);
            assert.equal((await sendAlert(branchAdmin.token, { type: "busy" })).status, 400);
            assert.equal((await sendAlert(branchAdmin.token, { type: "busy", message: "   " })).status, 400);
            assert.equal((await sendAlert(branchAdmin.token, { type: "busy", message: "x".repeat(501) })).status, 400);
        });

        it("shows the alert in the main-admin inbox", async () => {
            const res = await listAlerts(admin.token);
            assert.equal(res.status, 200);
            const alert = res.body.data.find((entry: { id: number }) => entry.id === alertId);
            assert.ok(alert, "the admin inbox must show the branch's alert");
            assert.equal(alert.status, "pending");
            assert.ok(alert.senderName);
        });

        it("filters by status", async () => {
            const pending = await listAlerts(admin.token, "?status=pending");
            assert.equal(pending.status, 200);
            assert.ok(pending.body.data.some((alert: { id: number }) => alert.id === alertId));

            const resolved = await listAlerts(admin.token, "?status=resolved");
            assert.equal(resolved.status, 200);
            assert.ok(!resolved.body.data.some((alert: { id: number }) => alert.id === alertId));
        });

        it("rejects unknown status filters", async () => {
            assert.equal((await listAlerts(admin.token, "?status=banana")).status, 400);
        });

        it("lets a branch admin see only their own history", async () => {
            const res = await listAlerts(branchAdmin.token);
            assert.equal(res.status, 200);
            assert.ok(res.body.data.length > 0);
            for (const alert of res.body.data) {
                assert.equal(alert.branchId, ownBranchId);
            }
        });

        it("forbids customers from the inbox and counts", async () => {
            assert.equal((await listAlerts(customer.token)).status, 403);
            assert.equal((await request("/alerts/pending-count", { token: customer.token })).status, 403);
        });

        it("requires a token everywhere", async () => {
            assert.equal((await request("/alerts")).status, 401);
            assert.equal((await request(`/alerts/${alertId}/status`, { method: "PATCH", body: { status: "resolved" } })).status, 401);
        });

        it("counts pending alerts and drops the count on acknowledge", async () => {
            const before = await request("/alerts/pending-count", { token: admin.token });
            assert.equal(before.status, 200);
            assert.ok(before.body.data.count >= 1);

            const acked = await request(`/alerts/${alertId}/status`, {
                method: "PATCH",
                token: admin.token,
                body: { status: "acknowledged" },
            });
            assert.equal(acked.status, 200);
            assert.equal(acked.body.data.status, "acknowledged");
            assert.equal(acked.body.data.acknowledgedBy, admin.id);
            assert.ok(acked.body.data.acknowledgedAt);

            const afterCount = await request("/alerts/pending-count", { token: admin.token });
            assert.equal(afterCount.body.data.count, before.body.data.count - 1);
        });

        it("keeps the original acknowledger when later resolved", async () => {
            const resolved = await request(`/alerts/${alertId}/status`, {
                method: "PATCH",
                token: admin.token,
                body: { status: "resolved" },
            });
            assert.equal(resolved.status, 200);
            assert.equal(resolved.body.data.status, "resolved");
            assert.equal(resolved.body.data.acknowledgedBy, admin.id);

            const filtered = await listAlerts(admin.token, "?status=resolved");
            assert.ok(filtered.body.data.some((alert: { id: number }) => alert.id === alertId));
            const pendingList = await listAlerts(admin.token, "?status=pending");
            assert.ok(!pendingList.body.data.some((alert: { id: number }) => alert.id === alertId));
        });

        it("only the main admin moves an alert along", async () => {
            const res = await request(`/alerts/${alertId}/status`, {
                method: "PATCH",
                token: branchAdmin.token,
                body: { status: "resolved" },
            });
            assert.equal(res.status, 403);
        });

        it("rejects bad status updates", async () => {
            const invalidStatus = await request(`/alerts/${alertId}/status`, {
                method: "PATCH",
                token: admin.token,
                body: { status: "done" },
            });
            assert.equal(invalidStatus.status, 400);

            const missing = await request("/alerts/999999/status", {
                method: "PATCH",
                token: admin.token,
                body: { status: "resolved" },
            });
            assert.equal(missing.status, 404);
        });
    });

    describe("assigning branch admins", () => {
        it("refuses to create a branch admin without a branch", async () => {
            const res = await request("/users", {
                method: "POST",
                token: admin.token,
                body: { name: "No Branch", email: uniqueEmail("nobranch"), role: "branch_admin" },
            });
            assert.equal(res.status, 400);
        });

        it("refuses to promote an existing user to branch_admin without a branch", async () => {
            const user = await request("/users", {
                method: "POST",
                token: admin.token,
                body: { name: "Suite Promotee", email: uniqueEmail("promotee"), phone: uniquePhone() },
            });
            assert.equal(user.status, 201);
            trackUser(user.body.data.id);

            const promote = await request(`/users/${user.body.data.id}`, {
                method: "PUT",
                token: admin.token,
                body: { role: "branch_admin" },
            });
            assert.equal(promote.status, 400);

            const withBranch = await request(`/users/${user.body.data.id}`, {
                method: "PUT",
                token: admin.token,
                body: { role: "branch_admin", branchId: otherBranchId },
            });
            assert.equal(withBranch.status, 200, JSON.stringify(withBranch.body));
            assert.equal(withBranch.body.data.role, "branch_admin");
            assert.equal(withBranch.body.data.branch_id, otherBranchId);
        });
    });
});
