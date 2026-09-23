import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { pool } from "../src/config/database.js";
import { finishSuite, login, request, seedAdmin, signupUser, startSuite, uniqueEmail, uniquePhone } from "./helpers.js";

before(startSuite);
after(finishSuite);

describe("auth", () => {
    it("creates a customer account and returns a working token", async () => {
        const user = await signupUser({ name: "Suite User" });

        assert.equal(typeof user.user.email, "string");
        assert.equal(user.user.role, "customer");
        assert.ok(typeof user.token === "string" && user.token.length > 0);

        const { status, body } = await request("/auth/me", { token: user.token });
        assert.equal(status, 200);
        assert.equal(body.data.email, user.user.email);
    });

    it("rejects malformed signup payloads with 400", async () => {
        const email = uniqueEmail("bad");
        const phone = uniquePhone();
        const valid = { name: "A Name", email, password: "StrongPass!123", phone };

        const cases = [
            { ...valid, name: "   " },
            { ...valid, email: "not-an-email" },
            { ...valid, password: "short" },
            { ...valid, phone: "010-xyz-123" },
        ];
        for (const body of cases) {
            const { status } = await request("/auth/signup", { method: "POST", body });
            assert.equal(status, 400, `expected 400 for ${JSON.stringify(body)}`);
        }
    });

    it("returns 409 when email or phone is already registered", async () => {
        const first = await signupUser();

        const dupEmail = await request("/auth/signup", {
            method: "POST",
            body: { name: "Dup", email: first.user.email, password: "StrongPass!123", phone: uniquePhone() },
        });
        assert.equal(dupEmail.status, 409);

        const dupPhone = await request("/auth/signup", {
            method: "POST",
            body: { name: "Dup", email: uniqueEmail("dup"), password: "StrongPass!123", phone: first.user.phone },
        });
        assert.equal(dupPhone.status, 409);
    });

    it("returns the same generic 401 for an unknown email, wrong password, and disabled account", async () => {
        const actor = await signupUser();

        await pool.query("UPDATE users SET is_active = false WHERE id = $1", [actor.user.id]);

        const unknown = await login(uniqueEmail("unknown"), "Whatever!123");
        const wrongPassword = await login(actor.user.email, "NotThePassword!");
        const disabled = await login(actor.user.email, actor.password);

        for (const result of [unknown, wrongPassword, disabled]) {
            assert.equal(result.status, 401);
            assert.equal(result.body.message, "Invalid email or password");
        }
    });

    it("logs in as admin when credentials are valid", async () => {
        const admin = await seedAdmin();

        const { status, body } = await login(admin.email, admin.password);
        assert.equal(status, 200);
        assert.equal(body.data.user.role, "admin");
        assert.ok(typeof body.data.token === "string" && body.data.token.length > 0);
    });
});