import { Pool, PoolClient } from "pg";
import { CartIdentity, CartLine, CartLineOption, CartView } from "./cart.types.js";

// Type alias so repository helpers accept either the module pool or an
// in-transaction client (both expose .query).
type Db = Pool | PoolClient;

export const emptyCartView = (): CartView => ({
    items: [],
    distinct_item_count: 0,
    item_count: 0,
    subtotal: 0,
});

/** Row shape of the cart view query. */
interface CartLineRow {
    id: number;
    product_id: number;
    name: string;
    image: string;
    quantity: number;
    unit_price: string | number;
    is_available: boolean;
    options_signature: string;
    selection_summary: string;
    options_snapshot: CartLineOption[] | null;
}

export const CartRepository = () => {
    const getOrCreateCartId = async (db: Db, identity: CartIdentity): Promise<number> => {
        if (identity.kind === "user") {
            await db.query("INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [identity.userId]);
            const result = await db.query("SELECT id FROM carts WHERE user_id = $1", [identity.userId]);
            return result.rows[0].id;
        }
        await db.query("INSERT INTO carts (guest_token_hash) VALUES ($1) ON CONFLICT (guest_token_hash) DO NOTHING", [
            identity.guestHash,
        ]);
        const result = await db.query("SELECT id FROM carts WHERE guest_token_hash = $1", [identity.guestHash]);
        return result.rows[0].id;
    };

    const findCartId = async (db: Db, identity: CartIdentity): Promise<number | null> => {
        const result =
            identity.kind === "user"
                ? await db.query("SELECT id FROM carts WHERE user_id = $1", [identity.userId])
                : await db.query("SELECT id FROM carts WHERE guest_token_hash = $1", [identity.guestHash]);
        return result.rows[0]?.id ?? null;
    };

    /**
     * The cart view is rendered from what is STORED on the line (unit_price,
     * selection_summary, options_snapshot) - it is the record of the selection
     * the customer made. It is deliberately not a live price: checkout
     * re-prices every line from current DB state before the order is created.
     */
    const getCartView = async (db: Db, cartId: number): Promise<CartView> => {
        const result = await db.query<CartLineRow>(
            `SELECT ci.id, ci.product_id, p.name, p.image, ci.quantity, ci.unit_price,
                    p.is_available, ci.options_signature, ci.selection_summary, ci.options_snapshot
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = $1
             ORDER BY ci.id`,
            [cartId]
        );
        const items: CartLine[] = result.rows.map((row) => {
            const unitPrice = Number(row.unit_price);
            return {
                id: row.id,
                product_id: row.product_id,
                name: row.name,
                image: row.image,
                quantity: row.quantity,
                unit_price: unitPrice,
                subtotal: unitPrice * row.quantity,
                is_available: row.is_available,
                options_signature: row.options_signature ?? "",
                selection_summary: row.selection_summary ?? "",
                options: Array.isArray(row.options_snapshot) ? row.options_snapshot : [],
            };
        });
        return {
            items,
            distinct_item_count: items.length,
            item_count: items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        };
    };

    /** A line is "already there" when the same product AND the same selection exist. */
    const getCartLineQuery = async (db: Db, cartId: number, productID: number, optionsSignature: string) => {
        return db.query("SELECT 1 FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND options_signature = $3", [
            cartId,
            productID,
            optionsSignature,
        ]);
    };

    const countCartItems = async (db: Db, cartId: number): Promise<number> => {
        const result = await db.query("SELECT COUNT(*)::int AS count FROM cart_items WHERE cart_id = $1", [cartId]);
        return result.rows[0].count;
    };

    /**
     * Merges into the existing line when the configuration matches, otherwise
     * inserts a new one. The unit price / summary / snapshot are always the
     * freshly computed server-side values.
     */
    const upsertCartItem = async (
        db: Db,
        cartId: number,
        input: {
            productID: number;
            quantity: number;
            optionsSignature: string;
            optionsSnapshot: CartLineOption[];
            selectionSummary: string;
            unitPrice: number;
        },
        cap: number
    ) => {
        await db.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity, options_signature, options_snapshot, selection_summary, unit_price)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
             ON CONFLICT (cart_id, product_id, options_signature)
             DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $8),
                           options_snapshot = EXCLUDED.options_snapshot,
                           selection_summary = EXCLUDED.selection_summary,
                           unit_price = EXCLUDED.unit_price,
                           updated_at = CURRENT_TIMESTAMP`,
            [
                cartId,
                input.productID,
                input.quantity,
                input.optionsSignature,
                JSON.stringify(input.optionsSnapshot),
                input.selectionSummary,
                input.unitPrice,
                cap,
            ]
        );
    };

    const setCartItemQuantity = async (db: Db, cartId: number, cartItemID: number, quantity: number) => {
        const result = await db.query(
            `UPDATE cart_items SET quantity = $3, updated_at = CURRENT_TIMESTAMP
             WHERE cart_id = $1 AND id = $2`,
            [cartId, cartItemID, quantity]
        );
        return result.rowCount ?? 0;
    };

    const removeCartItem = async (db: Db, cartId: number, cartItemID: number) => {
        await db.query("DELETE FROM cart_items WHERE cart_id = $1 AND id = $2", [cartId, cartItemID]);
    };

    const clearCartItems = async (db: Db, cartId: number) => {
        await db.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    };

    const deleteCart = async (db: Db, cartId: number) => {
        await db.query("DELETE FROM carts WHERE id = $1", [cartId]);
    };

    return {
        getOrCreateCartId,
        findCartId,
        getCartView,
        getCartLineQuery,
        countCartItems,
        upsertCartItem,
        setCartItemQuantity,
        removeCartItem,
        clearCartItems,
        deleteCart,
    };
};
