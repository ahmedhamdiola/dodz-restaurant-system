import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { finishSuite, request, signupUser, startSuite, uniqueEmail } from "./helpers.js";
import { pool } from "../src/config/database.js";

before(startSuite);
after(finishSuite);

/** Products a customer is allowed to favourite: listed, orderable ingredients excluded. */
const listOrderableProductIDs = async (): Promise<number[]> => {
    const result = await pool.query(
        `SELECT id FROM products WHERE is_deleted = false AND is_modifier = false ORDER BY id LIMIT 5`
    );
    return result.rows.map((row) => row.id as number);
};

describe("favorites", () => {
    let orderable: number[];
    let modifierID: number;

    before(async () => {
        orderable = await listOrderableProductIDs();
        const modifier = await pool.query(
            `SELECT id FROM products WHERE is_modifier = true AND is_deleted = false LIMIT 1`
        );
        modifierID = modifier.rows[0]?.id ?? -1;
    });

    const fav = (path: string, token: string, method = "GET") =>
        request(`/favorites${path}`, { method, token });

    const list = async (token: string) => {
        const res = await fav("", token);
        assert.equal(res.status, 200);
        return res.body.data.productIDs as number[];
    };

    describe("authentication", () => {
        it("rejects every endpoint without a token", async () => {
            // Suffixes are relative to /favorites, matching the helper above.
            for (const [method, path] of [
                ["GET", ""],
                ["POST", `/${orderable[0]}`],
                ["DELETE", `/${orderable[0]}`],
                ["DELETE", ""],
                ["POST", "/merge"],
            ] as const) {
                const { status } = await request(`/favorites${path}`, { method });
                assert.equal(status, 401, `expected 401 for ${method} /favorites${path}`);
            }
        });

        it("rejects a garbage token", async () => {
            const { status } = await fav("", "not-a-real-token");
            assert.equal(status, 401);
        });
    });

    describe("reading", () => {
        it("starts empty for a fresh account", async () => {
            const { token } = await signupUser();
            assert.deepEqual(await list(token), []);
        });

        it("keeps two accounts isolated on a shared device", async () => {
            const first = await signupUser();
            const second = await signupUser();

            await fav(`/${orderable[0]}`, first.token, "POST");
            assert.deepEqual(await list(first.token), [orderable[0]]);
            assert.deepEqual(await list(second.token), [], "a second account must not inherit favourites");
        });
    });

    describe("add and remove", () => {
        it("favourites a product and preserves the order they were added in", async () => {
            const { token } = await signupUser();
            const [a, b, c] = orderable;

            assert.equal((await fav(`/${a}`, token, "POST")).status, 200);
            await fav(`/${b}`, token, "POST");
            await fav(`/${c}`, token, "POST");

            assert.deepEqual(await list(token), [a, b, c]);
        });

        it("is idempotent when the same product is favourited twice", async () => {
            const { token } = await signupUser();
            const id = orderable[0];

            await fav(`/${id}`, token, "POST");
            const second = await fav(`/${id}`, token, "POST");

            assert.equal(second.status, 200);
            assert.deepEqual(second.body.data.productIDs, [id], "must not duplicate the row");
            assert.deepEqual(await list(token), [id]);
        });

        it("is idempotent when a product is unfavourited twice", async () => {
            const { token } = await signupUser();
            const [a, b] = orderable;

            await fav(`/${a}`, token, "POST");
            await fav(`/${b}`, token, "POST");

            assert.equal((await fav(`/${a}`, token, "DELETE")).status, 200);
            const again = await fav(`/${a}`, token, "DELETE");

            assert.equal(again.status, 200);
            assert.deepEqual(again.body.data.productIDs, [b]);
        });

        it("removing a product that was never favourited is a no-op", async () => {
            const { token } = await signupUser();
            await fav(`/${orderable[0]}`, token, "POST");

            const res = await fav(`/${orderable[1]}`, token, "DELETE");
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.data.productIDs, [orderable[0]]);
        });

        it("clears the whole list in one call", async () => {
            const { token } = await signupUser();
            for (const id of orderable) await fav(`/${id}`, token, "POST");

            const res = await fav("", token, "DELETE");
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.data.productIDs, []);
            assert.deepEqual(await list(token), []);
        });
    });

    describe("validation", () => {
        it("refuses a modifier ingredient, which is never listed or bought alone", async function () {
            if (modifierID === -1) return; // no seeded modifier to test against
            const { token } = await signupUser();

            const res = await fav(`/${modifierID}`, token, "POST");
            assert.equal(res.status, 404);
            assert.deepEqual(await list(token), []);
        });

        it("refuses a product that does not exist", async () => {
            const { token } = await signupUser();
            const res = await fav("/99999999", token, "POST");
            assert.equal(res.status, 404);
        });

        it("refuses a non-positive or non-numeric id", async () => {
            const { token } = await signupUser();
            for (const bad of ["abc", "0", "-1"]) {
                const res = await fav(`/${bad}`, token, "POST");
                assert.equal(res.status, 400, `expected 400 for id ${bad}`);
            }
        });
    });

    describe("guest -> account merge", () => {
        it("absorbs guest ids without dropping ones the account already had", async () => {
            const { token } = await signupUser();
            const [a, b, c, d] = orderable;

            // The account favourited b before signing in on another device.
            await fav(`/${b}`, token, "POST");

            const merged = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: [a, b, c] },
            });
            assert.equal(merged.status, 200);
            assert.deepEqual(merged.body.data.productIDs, [b, a, c], "union, ordered by favourited-at");
        });

        it("drops unknown and non-orderable ids instead of failing the batch", async () => {
            const { token } = await signupUser();
            const [a] = orderable;

            const res = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: [a, 99999999, -3, "nope", modifierID].filter((v) => v !== -1) },
            });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.data.productIDs, [a]);
        });

        it("deduplicates a repeated id within one payload", async () => {
            const { token } = await signupUser();
            const [a, b] = orderable;

            const res = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: [a, b, a, b] },
            });
            assert.deepEqual(res.body.data.productIDs, [a, b]);
        });

        it("rejects a payload that is not an array", async () => {
            const { token } = await signupUser();
            for (const body of [{ productIDs: "nope" }, { productIDs: null }, {}]) {
                const res = await request("/favorites/merge", { method: "POST", token, body });
                assert.equal(res.status, 400);
            }
        });

        it("rejects a payload beyond the cap", async () => {
            const { token } = await signupUser();
            const res = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: Array.from({ length: 501 }, (_, i) => i + 1) },
            });
            assert.equal(res.status, 400);
        });

        it("is a union, so the client clearing its local copy is what makes a retry safe", async () => {
            const { token } = await signupUser();
            const [a, b] = orderable;

            await request("/favorites/merge", { method: "POST", token, body: { productIDs: [a, b] } });
            await fav(`/${b}`, token, "DELETE");

            // Re-sending the same payload re-adds b: the server cannot tell a
            // retry from genuinely new guest favourites, so merge is defined as
            // a union. What actually protects a removal is the client wiping its
            // local copy after a confirmed merge, which leaves the retry empty.
            const resent = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: [a, b] },
            });
            assert.deepEqual(resent.body.data.productIDs, [a, b], "merge unions whatever it is given");

            await fav(`/${b}`, token, "DELETE");
            const emptyRetry = await request("/favorites/merge", {
                method: "POST",
                token,
                body: { productIDs: [] },
            });
            assert.deepEqual(
                emptyRetry.body.data.productIDs,
                [a],
                "the retry the client actually sends is empty and resurrects nothing"
            );
        });
    });

    describe("referential integrity", () => {
        it("drops a favourite whose product is later soft-deleted", async () => {
            const { token, user } = await signupUser();
            const [a, b] = orderable;
            await fav(`/${a}`, token, "POST");
            await fav(`/${b}`, token, "POST");

            // A soft delete must not leak the product back into the storefront.
            const soft = await pool.query(
                `UPDATE products SET is_deleted = true WHERE id = $1 RETURNING id`,
                [a]
            );
            assert.equal(soft.rowCount, 1);

            try {
                assert.deepEqual(await list(token), [b], "a deleted product must not stay favourited");

                // The row may linger, but it is invisible and comes back if the
                // product is restored, so no write path has to chase deletions.
                const row = await pool.query(
                    `SELECT COUNT(*)::int AS count FROM user_favorites WHERE user_id = $1 AND product_id = $2`,
                    [user.id, a]
                );
                assert.equal(row.rows[0].count, 1, "the row is retained, just filtered on read");
            } finally {
                await pool.query(`UPDATE products SET is_deleted = false WHERE id = $1`, [a]);
            }
        });

        it("clears a user's favourites when the account is deleted", async () => {
            const { token, user } = await signupUser();
            const id = orderable[0];
            await fav(`/${id}`, token, "POST");

            await pool.query(`DELETE FROM users WHERE id = $1`, [user.id]);

            const rows = await pool.query(`SELECT COUNT(*)::int AS count FROM user_favorites WHERE user_id = $1`, [
                user.id,
            ]);
            assert.equal(rows.rows[0].count, 0, "the FK must cascade");
        });

        it("refuses to favourite a product row that no longer exists", async () => {
            const { token } = await signupUser();
            await pool.query(
                `INSERT INTO categories (name, slug, cover_image, icon_image) VALUES ($1, $2, 'x', 'y') RETURNING id`,
                [uniqueEmail("cat").replace("@", "-"), `cat-${Date.now().toString(36)}`]
            );
            // Direct insert then delete proves the product FK cascades rather than dangling.
            const inserted = await pool.query(
                `INSERT INTO products (category_id, name, description, price, image)
                 SELECT id, 'Doomed', 'x', 1, 'y' FROM categories LIMIT 1 RETURNING id`
            );
            const doomed = inserted.rows[0].id;
            await fav(`/${doomed}`, token, "POST");
            await pool.query(`DELETE FROM products WHERE id = $1`, [doomed]);

            const rows = await pool.query(`SELECT COUNT(*)::int AS count FROM user_favorites WHERE product_id = $1`, [
                doomed,
            ]);
            assert.equal(rows.rows[0].count, 0, "deleting a product must cascade");
        });
    });
});
