import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "node:crypto";
import type { Server } from "node:http";
import app from "../src/app.js";
import { pool } from "../src/config/database.js";

// ---------------------------------------------------------------- unique ids

let counter = 0;
const stamp = Date.now().toString(36);

/** Unique email that the suite is allowed to hard-delete at the end of a run. */
export const uniqueEmail = (prefix: string) => `${prefix}.${stamp}.${++counter}@suite.test`;

/** Unique Egyptian mobile number ("011" + 8 digits) that will never collide with seeded data (010...). */
export const uniquePhone = (): string => {
    // Entropy has to survive two lossy steps: a digit-only filter and an 8-digit
    // truncation. Deriving from the millisecond clock does not — `stamp` is
    // base36, so it contributes only the digits that happen to appear in it and
    // a fast serial suite starts colliding past ~35 signups. A UUID always has
    // far more digits than the 8 that survive.
    const digits = `${randomUUID()}${randomUUID()}`.replace(/\D/g, "").padEnd(8, "0").slice(0, 8);
    return `011${digits}`;
};

/** Unique raw guest token (matches the server's [A-Za-z0-9_-]{16,128} rule). */
export const uniqueGuestToken = (): string => `t_${Date.now().toString(36)}_${++counter}_${randomUUID()}`;

// ---------------------------------------------------------------- http client

let server: Server | undefined;

export const startSuite = async () => {
    // Remove leftovers from a previously interrupted run so each run is deterministic.
    await pool.query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_name = $1)", ["Suite Tester"]);
    await pool.query("DELETE FROM orders WHERE customer_name = $1", ["Suite Tester"]);
    await pool.query("DELETE FROM users WHERE email LIKE '%@suite.test'");
    // Orphan guest carts (no account) from interrupted runs; user carts cascade on user delete above.
    await pool.query("DELETE FROM carts WHERE user_id IS NULL AND created_at < CURRENT_DATE - INTERVAL '1 day'");

    await new Promise<void>((resolve) => {
        server = app.listen(0, "127.0.0.1", () => resolve());
    });
};

const api = () => {
    if (!server) throw new Error("startSuite() must run first");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("server is not listening on a port");
    return `http://127.0.0.1:${address.port}/api/v1`;
};

export const request = async (
    path: string,
    options: { method?: string; token?: string; guestToken?: string; body?: unknown } = {}
) => {
    const res = await fetch(`${api()}${path}`, {
        method: options.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
            ...(options.guestToken ? { "X-Guest-Token": options.guestToken } : {}),
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }
    return { status: res.status, body: body as { success?: boolean; message?: string; data?: any } };
};

// ---------------------------------------------------------------- fixtures

const createdUserIds: number[] = [];
const createdOrderIds: number[] = [];
const createdGuestHashes: string[] = [];
const createdCouponIds: number[] = [];

export const trackUser = (id: number) => createdUserIds.push(id);
export const trackOrder = (id: number) => createdOrderIds.push(id);
/** Tracks a raw guest token so its cart is hard-deleted at the end of a run. */
export const trackGuestToken = (token: string) => createdGuestHashes.push(hashToken(token));
/** Tracks a coupon row so the suite never leaves offers behind in the dev database. */
export const trackCoupon = (id: number) => createdCouponIds.push(id);

/** Inserts a password-authenticated admin directly (the CLI equivalent of create:admin). */
export const seedAdmin = async (): Promise<{ id: number; email: string; password: string }> => {
    const password = "TestAdminPass!123";
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, provider, role, is_email_verified, is_active)
         VALUES ($1, $2, $3, $4, 'email', 'admin', true, true)
         ON CONFLICT (email) DO UPDATE SET role = 'admin'
         RETURNING id, email`,
        ["Suite Admin", uniqueEmail("admin"), uniquePhone(), passwordHash]
    );
    const { id, email } = result.rows[0] as { id: number; email: string };
    trackUser(id);
    return { id, email, password };
};

/** Creates a customer through the public signup endpoint and returns their token/user. */
export const signupUser = async (
    opts: { name?: string; email?: string; phone?: string; password?: string } = {}
) => {
    const fixture = {
        name: opts.name ?? "Suite User",
        email: opts.email ?? uniqueEmail("user"),
        phone: opts.phone ?? uniquePhone(),
        password: opts.password ?? "StrongPass!123",
    };
    const { status, body } = await request("/auth/signup", { method: "POST", body: fixture });
    if (status !== 201) throw new Error(`signup failed: ${status} ${JSON.stringify(body)}`);
    if (body.data?.user?.id) trackUser(body.data.user.id);
    return { token: body.data.token, user: body.data.user, password: fixture.password };
};

export const login = async (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: { email, password } });

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const finishSuite = async () => {
    try {
        if (createdOrderIds.length > 0) {
            await pool.query("DELETE FROM order_items WHERE order_id = ANY($1::int[])", [createdOrderIds]);
            await pool.query("DELETE FROM orders WHERE id = ANY($1::int[])", [createdOrderIds]);
        }
        if (createdGuestHashes.length > 0) {
            await pool.query("DELETE FROM carts WHERE guest_token_hash = ANY($1::char(64)[])", [createdGuestHashes]);
        }
        if (createdUserIds.length > 0) {
            await pool.query("DELETE FROM users WHERE id = ANY($1::int[])", [createdUserIds]);
        }
        // Redemptions go with their order (ON DELETE CASCADE), so only the coupon
        // rows themselves are left to clear.
        if (createdCouponIds.length > 0) {
            // Cleared explicitly rather than relying on the orders DELETE above: a
            // redemption whose order survived an aborted earlier run would
            // otherwise hold a RESTRICT on the coupon and fail the whole teardown.
            await pool.query("DELETE FROM order_coupons WHERE coupon_id = ANY($1::int[])", [createdCouponIds]);
            await pool.query("DELETE FROM coupons WHERE id = ANY($1::int[])", [createdCouponIds]);
        }
    } finally {
        await pool.end();
        if (server) {
            await new Promise<void>((resolve) => server!.close(() => resolve()));
        }
    }
};