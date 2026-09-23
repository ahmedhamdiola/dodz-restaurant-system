import { Pool, PoolClient } from "pg";
import { CartIdentity, CartItem, CartView } from "./cart.types.js";

// Type alias so repository helpers accept either the module pool or an
// in-transaction client (both expose .query).
type Db = Pool | PoolClient;

export const emptyCartView = (): CartView => ({
    items: [],
    distinct_item_count: 0,
    item_count: 0,
    subtotal: 0,
});

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

    const getCartView = async (db: Db, cartId: number): Promise<CartView> => {
        const result = await db.query<CartItem>(
            `SELECT ci.product_id, p.name, p.image, p.price AS unit_price, ci.quantity,
                    (p.price * ci.quantity) AS subtotal, p.is_available
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = $1
             ORDER BY ci.id`,
            [cartId]
        );
        const items = result.rows.map((row) => ({
            ...row,
            unit_price: Number(row.unit_price),
            subtotal: Number(row.subtotal),
        }));
        return {
            items,
            distinct_item_count: items.length,
            item_count: items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        };
    };

    const getCartByProductQuery = async (db: Db, cartId: number, productID: number) => {
        return db.query("SELECT 1 FROM cart_items WHERE cart_id = $1 AND product_id = $2", [cartId, productID]);
    };

    const countCartItems = async (db: Db, cartId: number): Promise<number> => {
        const result = await db.query("SELECT COUNT(*)::int AS count FROM cart_items WHERE cart_id = $1", [cartId]);
        return result.rows[0].count;
    };

    const upsertCartItem = async (db: Db, cartId: number, productID: number, quantity: number, cap: number) => {
        await db.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4), updated_at = CURRENT_TIMESTAMP`,
            [cartId, productID, quantity, cap]
        );
    };

    const setCartItemQuantity = async (db: Db, cartId: number, productID: number, quantity: number) => {
        const result = await db.query(
            `UPDATE cart_items SET quantity = $3, updated_at = CURRENT_TIMESTAMP
             WHERE cart_id = $1 AND product_id = $2`,
            [cartId, productID, quantity]
        );
        return result.rowCount ?? 0;
    };

    const removeCartItem = async (db: Db, cartId: number, productID: number) => {
        await db.query("DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2", [cartId, productID]);
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
        getCartByProductQuery,
        countCartItems,
        upsertCartItem,
        setCartItemQuantity,
        removeCartItem,
        clearCartItems,
        deleteCart,
    };
};