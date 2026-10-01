import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildOptionsSignature } from "../src/modules/product/product.options.service.js";
import {
    finishSuite,
    login,
    request,
    seedAdmin,
    signupUser,
    startSuite,
    trackGuestToken,
    trackOrder,
    uniqueGuestToken,
    uniquePhone,
} from "./helpers.js";
import { pool } from "../src/config/database.js";

/**
 * "Customize Your Meal" end-to-end contract.
 *
 * Every assertion is about the SERVER being authoritative: the client sends option
 * value ids, never prices. Anything that disagrees with the database must fail
 * closed - 400 when the request itself is wrong, 409 when the selection is no
 * longer orderable.
 *
 * Fixtures are owned by this suite: one customizable product and one plain
 * product are created here and hard-deleted in the single `after` hook, so no
 * seeded row is ever mutated.
 */

const OPTIONS_SUITE_CUSTOMER = "Options Suite";

let adminToken: string;
let customerToken: string;

let productId: number;
let basePrice: number;
let plainProductId: number;
let plainPrice: number;
let seededCustomizableId: number;
let modifierProductId: number;

let radioGroupId = 0;
let radioValueA = 0;
let radioValueB = 0;
let checkboxGroupId = 0;
let checkboxValueA = 0;
let checkboxValueB = 0;
let checkboxValueC = 0;

const createdProductIds: number[] = [];

const admin = (method: string, path: string, body?: unknown) => request(path, { method, token: adminToken, body });

const putTree = (id: number, options: unknown[]) => admin("PUT", `/products/${id}/options`, { options });

/** Public read of the tree, as an admin would (includeUnavailable=true). */
const readTree = (id: number) => request(`/products/${id}/options?includeUnavailable=true`, { token: adminToken });

/** Captures the ids the server assigned, so later payloads can update in place. */
const capture = (options: { id: number; values: { id: number }[] }[]) => {
    radioGroupId = options[0].id;
    radioValueA = options[0].values[0].id;
    radioValueB = options[0].values[1]?.id ?? -1;
    checkboxGroupId = options[1].id;
    checkboxValueA = options[1].values[0].id;
    checkboxValueB = options[1].values[1]?.id ?? -1;
    checkboxValueC = options[1].values[2]?.id ?? -1;
};

/** The canonical two-group tree: a required radio and an optional checkbox. */
const buildTree = (radioValues?: { name: string; price_delta: number; is_default?: boolean }[]) => [
    {
        name: "Main",
        type: "radio",
        is_required: true,
        min_selections: 1,
        max_selections: 1,
        sort_order: 1,
        is_available: true,
        values: (radioValues ?? [
            { name: "Beef", price_delta: 60, is_default: true },
            { name: "Chicken", price_delta: 50 },
        ]).map((value, index) => ({
            name: value.name,
            price_delta: value.price_delta,
            is_default: value.is_default ?? false,
            is_available: true,
            sort_order: index,
            modifier_product_id: null,
        })),
    },
    {
        name: "Extras",
        type: "checkbox",
        is_required: false,
        min_selections: 0,
        max_selections: 2,
        sort_order: 2,
        is_available: true,
        values: [
            { name: "Extra Cheese", price_delta: 15, is_available: true, sort_order: 0, modifier_product_id: null },
            { name: "Bacon", price_delta: 25, is_available: true, sort_order: 1, modifier_product_id: null },
            { name: "Fried Egg", price_delta: 20, is_available: true, sort_order: 2, modifier_product_id: null },
        ],
    },
];

/** Rebuilds the canonical tree from scratch and re-captures the new ids. */
const resetTree = async (radioValues?: { name: string; price_delta: number; is_default?: boolean }[]) => {
    const { status, body } = await putTree(productId, buildTree(radioValues));
    assert.equal(status, 200, `tree reset failed: ${JSON.stringify(body)}`);
    capture(body.data.options);
};

const guest = () => {
    const token = uniqueGuestToken();
    trackGuestToken(token);
    return token;
};

const addToCart = (tok: string, body: Record<string, unknown>) =>
    request("/cart/items", { method: "POST", guestToken: tok, body });

const cartOf = (tok: string) => request("/cart", { guestToken: tok });

const checkout = (tok: string) =>
    request("/cart/checkout", {
        method: "POST",
        guestToken: tok,
        body: {
            branchID: 1,
            customerName: OPTIONS_SUITE_CUSTOMER,
            customerPhone: uniquePhone(),
            idempotencyKey: uniqueGuestToken(),
        },
    });

before(startSuite);

after(async () => {
    try {
        if (createdProductIds.length > 0) {
            // order_items.product_id has no ON DELETE, so references go first.
            await pool.query("DELETE FROM order_items WHERE product_id = ANY($1::int[])", [createdProductIds]);
            await pool.query(
                `DELETE FROM orders o
                 WHERE o.customer_name = $1
                   AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)`,
                [OPTIONS_SUITE_CUSTOMER]
            );
            await pool.query("DELETE FROM carts WHERE id IN (SELECT cart_id FROM cart_items WHERE product_id = ANY($1::int[]))", [
                createdProductIds,
            ]);
            await pool.query("DELETE FROM cart_items WHERE product_id = ANY($1::int[])", [createdProductIds]);
            await pool.query("DELETE FROM products WHERE id = ANY($1::int[])", [createdProductIds]);
        }
    } finally {
        await finishSuite();
    }
});

describe("product options", () => {
    before(async () => {
        const adminUser = await seedAdmin();
        const adminLogin = await login(adminUser.email, adminUser.password);
        assert.equal(adminLogin.status, 200, "the admin fixture must be able to log in");
        adminToken = adminLogin.body.data.token;
        customerToken = (await signupUser()).token;

        const categoryId = (await pool.query("SELECT id FROM categories WHERE is_deleted = false ORDER BY id LIMIT 1")).rows[0].id;
        const insert = async (name: string, price: number) => {
            const result = await pool.query(
                `INSERT INTO products (category_id, name, description, price, image, is_available, is_customizable, is_modifier)
                 VALUES ($1, $2, 'created by the options suite', $3, 'https://example.test/item.jpg', true, false, false)
                 RETURNING id, price`,
                [categoryId, `${name} ${Date.now().toString(36)}`, price]
            );
            createdProductIds.push(result.rows[0].id);
            return { id: result.rows[0].id, price: Number(result.rows[0].price) };
        };

        const burger = await insert("Options Suite Burger", 200);
        productId = burger.id;
        basePrice = burger.price;

        const soda = await insert("Options Suite Soda", 35);
        plainProductId = soda.id;
        plainPrice = soda.price;

        seededCustomizableId =
            (
                await pool.query(
                    `SELECT id FROM products
                     WHERE is_deleted = false AND is_customizable AND is_available AND NOT is_modifier
                       AND EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id)
                     ORDER BY id LIMIT 1`
                )
            ).rows[0]?.id ?? -1;

        modifierProductId =
            (await pool.query("SELECT id FROM products WHERE is_modifier AND is_deleted = false ORDER BY id LIMIT 1")).rows[0]?.id ?? -1;
    });

    // ------------------------------------------------------------------ public read

    describe("public option tree", () => {
        it("returns an empty array for a product with no tree", async () => {
            const { status, body } = await request(`/products/${plainProductId}/options`);
            assert.equal(status, 200);
            assert.deepEqual(body.data.options, []);
        });

        it("404s for an unknown product", async () => {
            assert.equal((await request("/products/999999999/options")).status, 404);
        });

        it("hides the tree of a hidden modifier product", async () => {
            if (modifierProductId === -1) return;
            const { status } = await request(`/products/${modifierProductId}/options`);
            assert.equal(status, 404, "a modifier is not a customizable storefront product");
        });

        it("404s the detail endpoint for a hidden modifier product", async () => {
            if (modifierProductId === -1) return;
            assert.equal((await request(`/products/${modifierProductId}`)).status, 404);
        });

        it("keeps modifier products out of every storefront listing", async () => {
            const all = await request("/products");
            assert.equal(all.status, 200);
            assert.ok(
                !all.body.data.some((p: { is_modifier: boolean }) => p.is_modifier === true),
                "GET /products must not leak modifier rows"
            );

            const modifierCategoryId = (
                await pool.query("SELECT category_id FROM products WHERE is_modifier AND is_deleted = false ORDER BY id LIMIT 1")
            ).rows[0]?.category_id;
            if (modifierCategoryId) {
                const byCategory = await request(`/products/category/${modifierCategoryId}`);
                assert.equal(byCategory.status, 200);
                assert.ok(
                    !byCategory.body.data.some((p: { is_modifier: boolean }) => p.is_modifier === true),
                    "category listing must not leak modifier rows"
                );
            }
        });

        it("serves the seeded customizable tree without sold-out rows", async () => {
            if (seededCustomizableId === -1) return; // only meaningful once the seed has run
            const { status, body } = await request(`/products/${seededCustomizableId}/options`);
            assert.equal(status, 200);
            assert.ok(body.data.options.length > 0, "a seeded product must expose its groups");

            for (const group of body.data.options) {
                assert.equal(group.is_available, true);
                assert.ok(group.values.length > 0);
                if (group.type === "radio") {
                    assert.equal(group.max_selections, 1, "radio groups are pinned to a single pick");
                }
                for (const value of group.values) {
                    assert.equal(value.is_available, true);
                    assert.equal(typeof value.price_delta, "number");
                    assert.equal(typeof value.is_default, "boolean");
                }
            }
        });

        it("ignores includeUnavailable for anonymous callers", async () => {
            const tree = await request(`/products/${plainProductId}/options?includeUnavailable=true`);
            assert.equal(tree.status, 200);
            assert.deepEqual(tree.body.data.options, []);

            const list = await request("/products?includeUnavailable=true");
            assert.equal(list.status, 200);
            assert.ok(
                !list.body.data.some((p: { is_modifier: boolean }) => p.is_modifier === true),
                "includeUnavailable must not be honoured without an admin token"
            );
        });
    });

    // ------------------------------------------------------------------ admin auth

    describe("admin authorisation", () => {
        it("requires authentication for every option mutation", async () => {
            const calls: [string, string, unknown?][] = [
                ["PUT", `/products/${productId}/options`, { options: [] }],
                ["DELETE", `/products/${productId}/options/1`],
                ["PUT", "/products/options/values/1", { is_available: false }],
            ];
            for (const [method, path, body] of calls) {
                assert.equal((await request(path, { method, body })).status, 401, `${method} ${path} must require auth`);
            }
            assert.equal((await request("/products/options/modifiers")).status, 401);
        });

        it("rejects a signed-in customer", async () => {
            const put = await request(`/products/${productId}/options`, {
                method: "PUT",
                token: customerToken,
                body: { options: [] },
            });
            assert.equal(put.status, 403);
            assert.equal((await request("/products/options/modifiers", { token: customerToken })).status, 403);
        });

        it("lists modifier products for the admin picker", async () => {
            const { status, body } = await request("/products/options/modifiers", { token: adminToken });
            assert.equal(status, 200);
            assert.ok(Array.isArray(body.data));
            assert.ok(body.data.length > 0, "the seed defines hidden modifier products");
            for (const modifier of body.data) {
                assert.equal(typeof modifier.id, "number");
                assert.equal(typeof modifier.name, "string");
            }
        });
    });

    // ------------------------------------------------------------------ full replace

    describe("full replace", () => {
        it("creates the tree, returns the persisted rows and flips is_customizable", async () => {
            const { status, body } = await putTree(productId, buildTree());
            assert.equal(status, 200);

            const options = body.data.options;
            assert.equal(options.length, 2);
            assert.equal(options[0].name, "Main");
            assert.equal(options[0].type, "radio");
            assert.equal(options[0].max_selections, 1);
            assert.equal(options[0].is_required, true);
            assert.equal(options[1].name, "Extras");
            assert.equal(options[1].max_selections, 2);
            assert.equal(options[1].values.length, 3);
            capture(options);

            const flag = await pool.query("SELECT is_customizable FROM products WHERE id = $1", [productId]);
            assert.equal(flag.rows[0].is_customizable, true, "the tree and the flag stay in sync");
        });

        it("links a hidden modifier product to a value", async () => {
            const { status, body } = await putTree(productId, [
                {
                    id: radioGroupId,
                    name: "Main",
                    type: "radio",
                    is_required: true,
                    min_selections: 1,
                    max_selections: 1,
                    sort_order: 1,
                    is_available: true,
                    values: [
                        { id: radioValueA, name: "Beef", price_delta: 60, is_default: true, is_available: true, sort_order: 0 },
                        { id: radioValueB, name: "Chicken", price_delta: 50, is_available: true, sort_order: 1, modifier_product_id: modifierProductId },
                    ],
                },
                {
                    id: checkboxGroupId,
                    name: "Extras",
                    type: "checkbox",
                    is_required: false,
                    min_selections: 0,
                    max_selections: 2,
                    sort_order: 2,
                    is_available: true,
                    values: [
                        { id: checkboxValueA, name: "Extra Cheese", price_delta: 15, is_available: true, sort_order: 0, modifier_product_id: null },
                        { id: checkboxValueB, name: "Bacon", price_delta: 25, is_available: true, sort_order: 1, modifier_product_id: null },
                        { id: checkboxValueC, name: "Fried Egg", price_delta: 20, is_available: true, sort_order: 2, modifier_product_id: null },
                    ],
                },
            ]);
            assert.equal(status, 200);
            capture(body.data.options);

            const linked = body.data.options[0].values[1];
            assert.equal(linked.modifier_product_id, modifierProductId, "the value points at the hidden ingredient");
            assert.equal(linked.modifier.id, modifierProductId);
            assert.equal(typeof linked.modifier.name, "string");
        });

        it("updates in place and removes anything the payload omits", async () => {
            const { status, body } = await putTree(productId, [
                {
                    id: radioGroupId,
                    name: "Protein",
                    type: "radio",
                    is_required: true,
                    min_selections: 1,
                    max_selections: 1,
                    sort_order: 1,
                    is_available: true,
                    values: [
                        { id: radioValueA, name: "Beef", price_delta: 60, is_default: true, is_available: true, sort_order: 0 },
                        { id: radioValueB, name: "Chicken", price_delta: 50, is_available: true, sort_order: 1 },
                    ],
                },
                {
                    id: checkboxGroupId,
                    name: "Extras",
                    type: "checkbox",
                    is_required: false,
                    min_selections: 0,
                    max_selections: 2,
                    sort_order: 2,
                    is_available: true,
                    values: [
                        { id: checkboxValueA, name: "Extra Cheese", price_delta: 15, is_available: true, sort_order: 0 },
                    ],
                },
            ]);
            assert.equal(status, 200);
            assert.equal(body.data.options[0].name, "Protein", "renamed in place");
            assert.equal(body.data.options[0].id, radioGroupId, "ids stay stable so live carts keep resolving");
            assert.equal(body.data.options[1].values.length, 1, "omitted values are removed");

            const orphans = await pool.query("SELECT id FROM option_values WHERE id = ANY($1::int[])", [
                [checkboxValueB, checkboxValueC],
            ]);
            assert.equal(orphans.rows.length, 0, "removed values are really gone");
        });

        it("emptying the tree clears is_customizable", async () => {
            assert.equal((await putTree(productId, [])).status, 200);
            const flag = await pool.query("SELECT is_customizable FROM products WHERE id = $1", [productId]);
            assert.equal(flag.rows[0].is_customizable, false, "no groups means not customizable");
            await resetTree();
        });
    });

    // ------------------------------------------------------------------ validation

    describe("payload validation", () => {
        /**
         * A rejected replace must be atomic: the stored tree has to come out
         * byte-for-byte identical.
         */
        const rejectsAtomically = async (options: unknown[], expectedFragment?: string) => {
            const before = await readTree(productId);
            const { status, body } = await putTree(productId, options);
            assert.equal(status, 400, `expected 400 for ${JSON.stringify(options).slice(0, 160)}`);
            if (expectedFragment) {
                assert.ok(
                    String(body.message).toLowerCase().includes(expectedFragment.toLowerCase()),
                    `message "${body.message}" should mention "${expectedFragment}"`
                );
            }
            const after = await readTree(productId);
            assert.deepEqual(after.body.data.options, before.body.data.options, "a rejected replace changed the tree");
        };

        it("rejects a missing or non-array options payload without wiping the tree", async () => {
            for (const body of [{}, { options: "nope" }, { options: 1 }, { options: { a: 1 } }]) {
                assert.equal((await admin("PUT", `/products/${productId}/options`, body)).status, 400, JSON.stringify(body));
            }
            const after = await readTree(productId);
            assert.equal(after.body.data.options.length, 2, "a malformed payload must never delete the tree");
        });

        it("404s an unknown product", async () => {
            assert.equal((await putTree(999999999, buildTree())).status, 404);
        });

        it("rejects malformed groups", async () => {
            await rejectsAtomically([{ name: "", type: "radio" }], "name");
            await rejectsAtomically([{ name: "Main", type: "toggle" }], "radio");
            await rejectsAtomically([{ name: "Main", type: "checkbox", min_selections: 3, max_selections: 1 }], "at most");
            await rejectsAtomically([{ name: "Main", type: "radio", is_required: true, values: [] }], "required");
            await rejectsAtomically([{ name: "Main", type: "radio", values: [] }, "not an object"], undefined);
        });

        it("rejects malformed values", async () => {
            await rejectsAtomically([{ name: "Main", type: "checkbox", values: [{ name: "A", price_delta: -1 }] }], "price_delta");
            await rejectsAtomically([{ name: "Main", type: "checkbox", values: [{ name: "", price_delta: 1 }] }], "name");
            await rejectsAtomically(
                [
                    {
                        name: "Main",
                        type: "checkbox",
                        min_selections: 0,
                        max_selections: 2,
                        values: [{ name: "A", price_delta: 1, description: "x".repeat(501) }],
                    },
                ],
                "description"
            );
        });

        it("caps the number of groups and values", async () => {
            const group = (n: number) =>
                Array.from({ length: n }, (_, i) => ({
                    name: `Group ${i}`,
                    type: "checkbox",
                    is_required: false,
                    min_selections: 0,
                    max_selections: 1,
                    sort_order: i,
                    is_available: true,
                    values: [{ name: "A", price_delta: 0, is_available: true, sort_order: 0 }],
                }));
            await rejectsAtomically(group(13), "at most 12");

            // One group, too many values.
            const wide = [
                {
                    name: "Wide",
                    type: "checkbox",
                    is_required: false,
                    min_selections: 0,
                    max_selections: 61,
                    sort_order: 0,
                    is_available: true,
                    values: Array.from({ length: 61 }, (_, i) => ({
                        name: `V${i}`,
                        price_delta: 0,
                        is_available: true,
                        sort_order: i,
                    })),
                },
            ];
            await rejectsAtomically(wide, "at most 60");
        });

        it("pins a radio group to one default and one pick", async () => {
            await rejectsAtomically(
                [
                    {
                        name: "Main",
                        type: "radio",
                        is_required: true,
                        min_selections: 1,
                        max_selections: 1,
                        values: [
                            { name: "A", price_delta: 0, is_default: true },
                            { name: "B", price_delta: 0, is_default: true },
                        ],
                    },
                ],
                "one default"
            );

            // A radio group is a single pick by definition; the server overrides
            // a contradictory max_selections rather than trusting the payload.
            const { status, body } = await putTree(productId, [
                {
                    name: "Main",
                    type: "radio",
                    is_required: true,
                    min_selections: 1,
                    max_selections: 5,
                    values: [{ name: "Only", price_delta: 0 }],
                },
            ]);
            assert.equal(status, 200);
            assert.equal(body.data.options[0].max_selections, 1);
            await resetTree();
        });

        it("refuses a group or value that belongs to another product", async () => {
            const foreign = await admin("PUT", `/products/${plainProductId}/options`, {
                options: [
                    {
                        name: "Size",
                        type: "radio",
                        is_required: true,
                        min_selections: 1,
                        max_selections: 1,
                        values: [{ name: "Small", price_delta: 0 }],
                    },
                ],
            });
            assert.equal(foreign.status, 200);
            const foreignGroupId = foreign.body.data.options[0].id;
            const foreignValueId = foreign.body.data.options[0].values[0].id;

            await rejectsAtomically([{ id: foreignGroupId, name: "Hijacked", type: "radio", values: [] }], "does not belong");
            await rejectsAtomically(
                [
                    {
                        name: "Main",
                        type: "radio",
                        is_required: true,
                        min_selections: 1,
                        max_selections: 1,
                        values: [{ id: foreignValueId, name: "Hijacked", price_delta: 0 }],
                    },
                ],
                "does not belong"
            );

            // Put the plain product back the way it was: no option tree. The replace above
// already removed the group, so there is nothing left to delete.
            assert.equal((await admin("PUT", `/products/${plainProductId}/options`, { options: [] })).status, 200);
            assert.deepEqual((await request(`/products/${plainProductId}/options`)).body.data.options, []);
        });

        it("requires modifier_product_id to reference a real modifier product", async () => {
            const withModifier = (modifierProductIdToUse: number | null) => [
                {
                    name: "Extras",
                    type: "checkbox",
                    is_required: false,
                    min_selections: 0,
                    max_selections: 2,
                    values: [{ name: "Linked", price_delta: 1, modifier_product_id: modifierProductIdToUse }],
                },
            ];

            await rejectsAtomically(withModifier(999999999), "modifier product");
            // A normal, orderable product is not a modifier.
            await rejectsAtomically(withModifier(plainProductId), "modifier product");
        });
    });

    // ------------------------------------------------------------------ patch / delete

    describe("value patch and group delete", () => {
        before(() => resetTree());

        it("marks one value sold out without touching the rest", async () => {
            const { status, body } = await admin("PUT", `/products/options/values/${radioValueB}`, {
                is_available: false,
                price_delta: 55.5,
            });
            assert.equal(status, 200);
            assert.equal(body.data.id, radioValueB);
            assert.equal(body.data.is_available, false);
            assert.equal(body.data.price_delta, 55.5);

            const asAdmin = await readTree(productId);
            assert.equal(asAdmin.body.data.options[0].values.find((v: { id: number }) => v.id === radioValueB).is_available, false);

            const asPublic = await request(`/products/${productId}/options`);
            assert.ok(
                !asPublic.body.data.options[0].values.some((v: { id: number }) => v.id === radioValueB),
                "the public tree hides sold-out values"
            );
        });

        it("validates the patch body", async () => {
            const patch = (body: unknown, valueId = radioValueB) => admin("PUT", `/products/options/values/${valueId}`, body);
            assert.equal((await patch({})).status, 400);
            assert.equal((await patch({ is_available: "yes" })).status, 400);
            assert.equal((await patch({ price_delta: -5 })).status, 400);
            assert.equal((await patch({ is_available: false }, 999999999)).status, 400);
        });

        it("deletes one group, cascades its values and updates the flag", async () => {
            const deleted = await admin("DELETE", `/products/${productId}/options/${checkboxGroupId}`);
            assert.equal(deleted.status, 204, "the delete endpoint answers 204 No Content");

            const values = await pool.query("SELECT id FROM option_values WHERE option_id = $1", [checkboxGroupId]);
            assert.equal(values.rows.length, 0, "values cascade with their group");

            const tree = await request(`/products/${productId}/options`);
            assert.equal(tree.body.data.options.length, 1);
            assert.equal(tree.body.data.options[0].name, "Main");

            const flag = await pool.query("SELECT is_customizable FROM products WHERE id = $1", [productId]);
            assert.equal(flag.rows[0].is_customizable, true, "one group left still means customizable");

            assert.equal((await admin("DELETE", `/products/${productId}/options/${radioGroupId}`)).status, 204);
            const flagAfter = await pool.query("SELECT is_customizable FROM products WHERE id = $1", [productId]);
            assert.equal(flagAfter.rows[0].is_customizable, false, "no groups left means not customizable");
            assert.equal((await admin("DELETE", `/products/${productId}/options/${radioGroupId}`)).status, 404);
        });
    });

    // ------------------------------------------------------------------ cart

    describe("cart pricing and validation", () => {
        before(() => resetTree());

        it("prices the selection server-side and echoes the snapshot", async () => {
            const tok = guest();
            const { status, body } = await addToCart(tok, {
                productID: productId,
                quantity: 2,
                optionValueIDs: [radioValueA, checkboxValueA],
            });
            assert.equal(status, 201);

            const expectedUnit = basePrice + 60 + 15;
            const line = body.data.items[0];
            assert.equal(Number(line.unit_price), expectedUnit, "base price plus the sum of the deltas");
            assert.equal(Number(line.subtotal), expectedUnit * 2);
            assert.equal(body.data.subtotal, expectedUnit * 2);
            assert.equal(line.options_signature.length, 64, "sha256 hex");
            assert.ok(
                line.selection_summary.includes("Beef"),
                "the summary names the chosen options"
            );
            assert.ok(
                !line.selection_summary.includes("Main"),
                "the summary omits the group title"
            );
            assert.equal(line.options.length, 2);
            assert.equal(line.options[0].option_id, radioGroupId);
            assert.equal(line.options[0].value_id, radioValueA);
            assert.equal(line.options[0].price_delta, 60);
        });

        it("is order-insensitive: the same selection collapses onto one line", async () => {
            const tok = guest();
            const first = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA, checkboxValueA] });
            const second = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [checkboxValueA, radioValueA] });
            assert.equal(first.status, 201);
            assert.equal(second.status, 201);
            assert.equal(second.body.data.items.length, 1, "the signature does not depend on input order");
            assert.equal(second.body.data.items[0].quantity, 2);
            assert.equal(second.body.data.items[0].options_signature, first.body.data.items[0].options_signature);
        });

        it("keeps different configurations as separate lines", async () => {
            const tok = guest();
            await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA] });
            const { status, body } = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });
            assert.equal(status, 201);
            assert.equal(body.data.items.length, 2, "one product, two customizations, two lines");
            assert.notEqual(body.data.items[0].options_signature, body.data.items[1].options_signature);
        });

        it("rejects an invalid selection with 400 and names the group", async () => {
            const cases: [Record<string, unknown>, string][] = [
                [{ productID: productId, optionValueIDs: [] }, "main"],
                [{ productID: productId, optionValueIDs: [radioValueA, radioValueA] }, "more than once"],
                [{ productID: productId, optionValueIDs: [radioValueA, radioValueB] }, "only one"],
                [{ productID: productId, optionValueIDs: [radioValueA, checkboxValueA, checkboxValueB, checkboxValueC] }, "up to 2"],
                [{ productID: productId, optionValueIDs: [checkboxValueA] }, "main"],
                [{ productID: productId, optionValueIDs: [radioValueA, 999999999] }, "not valid"],
                [{ productID: plainProductId, optionValueIDs: [radioValueA] }, "cannot be customized"],
                [{ productID: plainProductId, optionValueIDs: ["x"] }, "option selections"],
            ];
            for (const [body, fragment] of cases) {
                const tok = guest();
                const res = await addToCart(tok, { quantity: 1, ...body });
                assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
                assert.ok(
                    String(res.body.message).toLowerCase().includes(fragment),
                    `message "${res.body.message}" should mention "${fragment}"`
                );
                assert.equal((await cartOf(tok)).body.data.items.length, 0, "a rejected add writes nothing");
            }
        });

        it("refuses a modifier product even though the request shape is valid", async () => {
            if (modifierProductId === -1) return;
            const tok = guest();
            const { status, body } = await addToCart(tok, { productID: modifierProductId, quantity: 1 });
            assert.equal(status, 409);
            assert.equal(body.data.type, "UNAVAILABLE_PRODUCT");
        });

        it("refuses a sold-out selected value with 409", async () => {
            assert.equal((await admin("PUT", `/products/options/values/${radioValueB}`, { is_available: false })).status, 200);

            const tok = guest();
            const { status, body } = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });
            assert.equal(status, 409);
            assert.equal(body.data.type, "OPTION_UNAVAILABLE");
            assert.ok(String(body.message).includes("sold out"), body.message);

            assert.equal((await admin("PUT", `/products/options/values/${radioValueB}`, { is_available: true })).status, 200);
        });

        it("accepts an empty selection for a product without a tree", async () => {
            const tok = guest();
            const { status, body } = await addToCart(tok, { productID: plainProductId, quantity: 1 });
            assert.equal(status, 201);
            assert.equal(Number(body.data.items[0].unit_price), plainPrice);
            assert.equal(body.data.items[0].options_signature, "", "no selections means an empty signature");
            assert.deepEqual(body.data.items[0].options, []);
        });

        it("updates and removes a customized line by cart item id", async () => {
            const tok = guest();
            const added = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA] });
            const cartItemId = added.body.data.items[0].id;
            await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });
            const siblingId = (await cartOf(tok)).body.data.items.find((l: { id: number }) => l.id !== cartItemId).id;
            assert.notEqual(siblingId, cartItemId);

            const put = await request(`/cart/items/${cartItemId}`, {
                method: "PUT",
                guestToken: tok,
                body: { quantity: 4 },
            });
            assert.equal(put.status, 200);
            assert.equal(put.body.data.items[0].quantity, 4);
            assert.equal(put.body.data.items[0].id, cartItemId, "the customization survives a quantity change");

            const del = await request(`/cart/items/${cartItemId}`, { method: "DELETE", guestToken: tok });
            assert.equal(del.status, 200);
            assert.equal(del.body.data.items.length, 1);
            assert.equal(del.body.data.items[0].id, siblingId, "only the addressed line is removed");
        });

        it("merges a customized guest cart on login by signature", async () => {
            const tok = guest();
            await addToCart(tok, { productID: productId, quantity: 2, optionValueIDs: [radioValueA] });
            await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });

            const customer = await signupUser();
            const merge = await request("/cart/merge", {
                method: "POST",
                token: customer.token,
                body: { guestToken: tok },
            });
            assert.equal(merge.status, 200);
            assert.equal(merge.body.data.items.length, 2, "both customizations survive the merge");
            assert.equal(merge.body.data.item_count, 3);
        });
    });

    // ------------------------------------------------------------------ checkout

    describe("checkout revalidation", () => {
        before(() => resetTree());

        it("snapshots the options onto the order line", async () => {
            const tok = guest();
            await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA, checkboxValueA] });

            const { status, body } = await checkout(tok);
            assert.equal(status, 201);
            if (body.data.id) trackOrder(body.data.id);

            const item = body.data.items.find((i: { product_id: number }) => i.product_id === productId);
            assert.ok(item, "the ordered line comes back");
            assert.equal(Number(item.unit_price), basePrice + 60 + 15);
            assert.ok(item.options_summary.length > 0, "the order keeps a readable summary");
            assert.deepEqual(
                item.options_snapshot.map((e: { value_id: number }) => e.value_id).sort((a: number, b: number) => a - b),
                [radioValueA, checkboxValueA].sort((a: number, b: number) => a - b)
            );

            const persisted = await pool.query(
                "SELECT options_summary, options_snapshot FROM order_items WHERE order_id = $1 AND product_id = $2",
                [body.data.id, productId]
            );
            assert.equal(persisted.rows.length, 1);
            assert.equal(persisted.rows[0].options_snapshot.length, 2, "the snapshot survives in the database");
        });

        it("re-prices from current DB state instead of trusting the cart", async () => {
            const tok = guest();
            const added = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA] });
            const cartPrice = Number(added.body.data.items[0].unit_price);

            // An admin changes the delta after the customer already added the item.
            assert.equal((await admin("PUT", `/products/options/values/${radioValueA}`, { price_delta: 70 })).status, 200);

            const { status, body } = await checkout(tok);
            assert.equal(status, 201);
            if (body.data.id) trackOrder(body.data.id);

            const item = body.data.items.find((i: { product_id: number }) => i.product_id === productId);
            assert.equal(Number(item.unit_price), basePrice + 70, "the order uses the current price");
            assert.notEqual(Number(item.unit_price), cartPrice, "the stale cart price is not trusted");

            assert.equal((await admin("PUT", `/products/options/values/${radioValueA}`, { price_delta: 60 })).status, 200);
        });

        it("409s and names the line when a selected value is sold out after adding", async () => {
            const tok = guest();
            const added = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });
            const cartItemId = added.body.data.items[0].id;

            assert.equal((await admin("PUT", `/products/options/values/${radioValueB}`, { is_available: false })).status, 200);

            const { status, body } = await checkout(tok);
            assert.equal(status, 409);
            assert.equal(body.data.type, "OPTION_UNAVAILABLE");
            assert.deepEqual(body.data.unavailableProductIds, [productId]);
            assert.deepEqual(body.data.unavailableCartItemIds, [cartItemId], "the UI can point at the exact line");
            assert.equal((await cartOf(tok)).body.data.items.length, 1, "a failed checkout leaves the cart intact");

            assert.equal((await admin("PUT", `/products/options/values/${radioValueB}`, { is_available: true })).status, 200);
        });

        it("409s when the option the customer picked has since been deleted", async () => {
            const tok = guest();
            const added = await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueB] });
            assert.equal(added.status, 201);

            // Rebuild the tree without that value, exactly as an admin might.
            await resetTree([{ name: "Beef", price_delta: 60, is_default: true }]);

            const { status, body } = await checkout(tok);
            assert.equal(status, 409);
            assert.equal(body.data.type, "OPTION_UNAVAILABLE");
            assert.ok(String(body.message).includes("no longer"), body.message);
        });

        it("409s when the whole product goes unavailable after adding", async () => {
            const tok = guest();
            await addToCart(tok, { productID: productId, quantity: 1, optionValueIDs: [radioValueA] });
            await pool.query("UPDATE products SET is_available = false WHERE id = $1", [productId]);

            try {
                const { status, body } = await checkout(tok);
                assert.equal(status, 409);
                assert.equal(body.data.type, "UNAVAILABLE_PRODUCT");
                assert.deepEqual(body.data.unavailableProductIds, [productId]);
            } finally {
                await pool.query("UPDATE products SET is_available = true WHERE id = $1", [productId]);
            }
        });
    });

    // ---------------------------------------------------------------- piece mix
    // A fried-chicken meal is a FIXED number of pieces the customer splits
    // between two sides. These cover the two things that are easy to get wrong:
    // the total must be exact, and different splits must stay separate lines.

    describe("piece mix", () => {
        const PIECES = 12;
        let originalValue = 0;
        let spicyValue = 0;

        /** Group payload shape accepted by the replace endpoint. */
        type PieceGroup = Record<string, unknown>;

        /** Two linked quantity groups totalling 12, both sides priced at 0. */
        const buildPieceTree = (total = PIECES): PieceGroup[] => [
            {
                name: "Original Pieces",
                type: "quantity",
                linked_total: total,
                linked_to_index: 1,
                unit_label: "pieces",
                sort_order: 1,
                is_available: true,
                values: [{ name: "Original", price_delta: 0, is_available: true, sort_order: 0, modifier_product_id: null }],
            },
            {
                name: "Spicy Pieces",
                type: "quantity",
                linked_total: total,
                linked_to_index: 0,
                unit_label: "pieces",
                sort_order: 2,
                is_available: true,
                values: [{ name: "Spicy", price_delta: 0, is_available: true, sort_order: 0, modifier_product_id: null }],
            },
        ];

        const resetPieceTree = async (total = PIECES) => {
            const { status, body } = await putTree(productId, buildPieceTree(total));
            assert.equal(status, 200, `piece tree reset failed: ${JSON.stringify(body)}`);
            originalValue = body.data.options[0].values[0].id;
            spicyValue = body.data.options[1].values[0].id;
        };

        before(async () => {
            await resetPieceTree();
        });

        it("links the two halves of the pair", async () => {
            const { body } = await readTree(productId);
            const [original, spicy] = body.data.options;
            assert.equal(original.type, "quantity");
            assert.equal(original.linked_total, PIECES);
            assert.equal(original.unit_label, "pieces");
            assert.equal(original.linked_group_id, spicy.id);
            assert.equal(spicy.linked_group_id, original.id);
        });

        it("accepts a split that totals the fixed number of pieces", async () => {
            const tok = guest();
            const { status, body } = await addToCart(tok, {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: 8 },
                    { valueId: spicyValue, quantity: 4 },
                ],
            });
            assert.equal(status, 201, JSON.stringify(body));
            const line = body.data.items[0];
            // Splitting pieces is a choice, not an addition: the price is unchanged.
            assert.equal(Number(line.unit_price), basePrice);
            assert.equal(line.selection_summary, "Original ×8, Spicy ×4");
        });

        it("rejects a split that does not total the fixed number of pieces", async () => {
            const tok = guest();
            for (const counts of [
                { originalValue: 8, spicyValue: 3 },
                { originalValue: 13, spicyValue: 0 },
                { originalValue: 0, spicyValue: 0 },
            ]) {
                const { status, body } = await addToCart(tok, {
                    productID: productId,
                    quantity: 1,
                    optionQuantities: [
                        { valueId: originalValue, quantity: counts.originalValue },
                        { valueId: spicyValue, quantity: counts.spicyValue },
                    ],
                });
                assert.equal(status, 400, `expected rejection for ${JSON.stringify(counts)}`);
                assert.match(String(body.message), /12 pieces in total/);
            }
        });

        it("keeps different splits as separate cart lines", async () => {
            const tok = guest();
            const first = await addToCart(tok, {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: 8 },
                    { valueId: spicyValue, quantity: 4 },
                ],
            });
            const second = await addToCart(tok, {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: 6 },
                    { valueId: spicyValue, quantity: 6 },
                ],
            });
            assert.equal(first.status, 201);
            assert.equal(second.status, 201);
            // Same product, same value ids, different counts: these must NOT merge.
            assert.equal(second.body.data.items.length, 2);
        });

        it("merges an identical split added twice", async () => {
            const tok = guest();
            const body = {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: 9 },
                    { valueId: spicyValue, quantity: 3 },
                ],
            };
            await addToCart(tok, body);
            const { status, body: second } = await addToCart(tok, body);
            assert.equal(status, 201);
            assert.equal(second.data.items.length, 1);
            assert.equal(second.data.items[0].quantity, 2);
        });

        it("rejects a negative count", async () => {
            const tok = guest();
            const { status } = await addToCart(tok, {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: -1 },
                    { valueId: spicyValue, quantity: 13 },
                ],
            });
            assert.equal(status, 400);
        });

        it("rejects counting a value that belongs to a pickable group", async () => {
            const { status, body } = await addToCart(guest(), {
                productID: productId,
                quantity: 1,
                optionQuantities: [{ valueId: originalValue, quantity: 12 }, { valueId: 999999, quantity: 0 }],
            });
            assert.equal(status, 400, JSON.stringify(body));
        });

        it("re-checks the split at checkout from the stored snapshot", async () => {
            const tok = guest();
            await addToCart(tok, {
                productID: productId,
                quantity: 1,
                optionQuantities: [
                    { valueId: originalValue, quantity: 7 },
                    { valueId: spicyValue, quantity: 5 },
                ],
            });
            // Widen the pair behind the customer's back; the stored 7/5 no longer
            // satisfies it, so checkout must refuse rather than silently reprice.
            await pool.query("UPDATE product_options SET linked_total = 14 WHERE product_id = $1", [productId]);
            try {
                const { status, body } = await checkout(tok);
                assert.equal(status, 409);
                assert.equal(body.data.type, "OPTION_UNAVAILABLE");
            } finally {
                await resetPieceTree();
            }
        });

        it("refuses to save a counted group that is not linked to a matching pair", async () => {
            const orphan = await putTree(productId, [buildPieceTree()[0]]);
            assert.equal(orphan.status, 400);
            assert.match(String(orphan.body.message), /linked/i);

            const mismatched = buildPieceTree();
            mismatched[1].linked_total = PIECES + 1;
            const mismatch = await putTree(productId, mismatched);
            assert.equal(mismatch.status, 400);
            assert.match(String(mismatch.body.message), /same total/i);

            await resetPieceTree();
        });

        it("refuses to link a counted group to a pickable one", async () => {
            const { body } = await readTree(productId);
            const mixed = [
                { ...body.data.options[0], linked_to_index: 1 },
                { ...body.data.options[1], linked_to_index: 0, type: "radio" },
            ];
            const { status, body: response } = await putTree(productId, mixed);
            assert.equal(status, 400, JSON.stringify(response));
            assert.match(String(response.message), /counted group/i);
            await resetPieceTree();
        });

        it("refuses to link a counted group to itself", async () => {
            const { body } = await readTree(productId);
            const self = [{ ...body.data.options[0], linked_group_id: body.data.options[0].id }];
            const { status, body: response } = await putTree(productId, self);
            assert.equal(status, 400, JSON.stringify(response));
            await resetPieceTree();
        });

        it("stays orderable when the admin switches one half of the pair off", async () => {
            // The storefront hides an unavailable group, so the customer can never
            // see or satisfy the pair total. Refusing here would make the product
            // unbuyable over a control they cannot act on.
            await pool.query("UPDATE product_options SET is_available = false WHERE product_id = $1 AND sort_order = 2", [
                productId,
            ]);
            try {
                const tok = guest();
                const { status, body } = await addToCart(tok, {
                    productID: productId,
                    quantity: 1,
                    optionQuantities: [{ valueId: originalValue, quantity: 3 }],
                });
                assert.equal(status, 201, JSON.stringify(body));
                assert.equal(body.data.items[0].unit_price, basePrice);

                const paid = await checkout(tok);
                assert.equal(paid.status, 201, JSON.stringify(paid.body));
                if (paid.body.data.id) trackOrder(paid.body.data.id);
            } finally {
                await resetPieceTree();
            }
        });

        it("still refuses a broken link even when the partner is switched off", async () => {
            // Availability may change under the customer, but a counted group linked
            // to something that is not a counted group can never be fixed from the
            // storefront, so the "half off" allowance must not swallow it. The bad
            // link is written straight to the table: the save endpoint, correctly,
            // refuses to create one.
            const tree = buildPieceTree();
            tree.push({
                name: "Side Salad",
                type: "checkbox",
                min_selections: 0,
                max_selections: 1,
                sort_order: 3,
                is_available: true,
                values: [{ name: "Salad", price_delta: 0, is_available: true, sort_order: 0, modifier_product_id: null }],
            });
            const saved = await putTree(productId, tree);
            assert.equal(saved.status, 200, JSON.stringify(saved.body));
            const saladGroupId = saved.body.data.options[2].id;
            // A full replace re-issues group ids, so the counted value must be read
            // back from THIS response rather than reusing the captured fixture id.
            const liveOriginalValue = saved.body.data.options[0].values[0].id;

            await pool.query("UPDATE product_options SET linked_group_id = $1 WHERE product_id = $2 AND sort_order = 1", [
                saladGroupId,
                productId,
            ]);
            await pool.query("UPDATE product_options SET is_available = false WHERE id = $1", [saladGroupId]);
            try {
                const tok = guest();
                const { status, body } = await addToCart(tok, {
                    productID: productId,
                    quantity: 1,
                    optionQuantities: [{ valueId: liveOriginalValue, quantity: 3 }],
                });
                assert.equal(status, 400, JSON.stringify(body));
                assert.match(String(body.message), /set up correctly/i);
            } finally {
                await resetPieceTree();
            }
        });

        it("refuses to delete one half of a counted pair", async () => {
            // linked_group_id is ON DELETE CASCADE, so this used to silently destroy
            // the partner along with the group the admin asked to remove.
            const { body } = await readTree(productId);
            const [original, spicy] = body.data.options;

            const refused = await admin("DELETE", `/products/${productId}/options/${spicy.id}`);
            assert.equal(refused.status, 400, JSON.stringify(refused.body));
            assert.match(String(refused.body.message), /counted pair/i);

            const partner = await pool.query("SELECT id FROM product_options WHERE id = $1", [original.id]);
            assert.equal(partner.rows.length, 1, "the other half of the pair must survive");

            const gone = await pool.query("SELECT id FROM product_options WHERE id = $1", [spicy.id]);
            assert.equal(gone.rows.length, 1, "the rejected delete must not have removed the group either");
            await resetPieceTree();
        });
    });
});
describe("buildOptionsSignature", () => {
    it("stays byte-identical to the legacy id-only hash when no counts are given", () => {
        const legacy = (ids: number[]) =>
            createHash("sha256").update([...new Set(ids)].sort((a, b) => a - b).join(",")).digest("hex");

        assert.equal(buildOptionsSignature([7, 3, 9]), legacy([7, 3, 9]));
        assert.equal(buildOptionsSignature([5]), legacy([5]));
        // A zero or empty count list is the same as no counts at all.
        assert.equal(buildOptionsSignature([5, 4], []), legacy([5, 4]));
        assert.equal(buildOptionsSignature([5, 4], [{ valueId: 5, quantity: 0 }]), legacy([5, 4]));
    });

    it("separates the same ids carrying different counts", () => {
        const a = buildOptionsSignature([11, 12], [
            { valueId: 11, quantity: 8 },
            { valueId: 12, quantity: 4 },
        ]);
        const b = buildOptionsSignature([11, 12], [
            { valueId: 11, quantity: 6 },
            { valueId: 12, quantity: 6 },
        ]);
        assert.notEqual(a, b);
    });

    it("is order independent and collapses duplicate ids and counts", () => {
        const a = buildOptionsSignature([12, 11], [
            { valueId: 12, quantity: 4 },
            { valueId: 11, quantity: 8 },
        ]);
        const b = buildOptionsSignature([11, 12, 11], [
            { valueId: 11, quantity: 8 },
            { valueId: 12, quantity: 4 },
            { valueId: 12, quantity: 4 },
        ]);
        assert.equal(a, b);
    });

    it("returns an empty string for a plain line with no options", () => {
        assert.equal(buildOptionsSignature([]), "");
    });
});
