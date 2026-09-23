import { createHash } from "node:crypto";
import { pool } from "../../config/database.js";
import { BranchRepository } from "../branch/branch.repository.js";
import { insertOrderAndItems, priceOrderItems, PricedProduct } from "../order/order.repository.js";
import { CartRepository, emptyCartView } from "./cart.repository.js";
import {
    CartError,
    CartIdentity,
    CartView,
    CheckoutInput,
    MAX_DISTINCT_ITEMS,
    MAX_QUANTITY,
} from "./cart.types.js";

export const hashGuestToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");

export const CartService = () => {
    const repo = CartRepository();
    const branchRepository = BranchRepository();

    const getCart = async (identity: CartIdentity | null): Promise<CartView> => {
        if (identity === null) {
            return emptyCartView();
        }
        const cartId = await repo.findCartId(pool, identity);
        return cartId === null ? emptyCartView() : repo.getCartView(pool, cartId);
    };

    const addItem = async (identity: CartIdentity, productID: number, quantity: number): Promise<CartView> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const cartId = await repo.getOrCreateCartId(client, identity);

            const present = await repo.getCartByProductQuery(client, cartId, productID);
            if (present.rowCount === 0) {
                const count = await repo.countCartItems(client, cartId);
                if (count >= MAX_DISTINCT_ITEMS) {
                    throw new CartError("CART_FULL", "Cart is full (max 50 different items)");
                }
            }

            const productResult = await client.query<PricedProduct>(
                `SELECT id, name, price, is_available FROM products WHERE id = $1 AND is_deleted = false`,
                [productID]
            );
            const product = productResult.rows[0] ?? null;
            if (product === null) {
                throw new CartError("MISSING_PRODUCT", "Product not found");
            }
            if (!product.is_available) {
                throw new CartError("UNAVAILABLE_PRODUCT", "Product is not currently available");
            }

            await repo.upsertCartItem(client, cartId, productID, quantity, MAX_QUANTITY);
            const view = await repo.getCartView(client, cartId);

            await client.query("COMMIT");
            return view;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const setItemQuantity = async (identity: CartIdentity, productID: number, quantity: number): Promise<CartView> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const cartId = await repo.getOrCreateCartId(client, identity);
            const updated = await repo.setCartItemQuantity(client, cartId, productID, quantity);
            if (updated === 0) {
                throw new CartError("CART_NOT_FOUND", "Item is not in your cart");
            }

            const view = await repo.getCartView(client, cartId);
            await client.query("COMMIT");
            return view;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const removeItem = async (identity: CartIdentity, productID: number): Promise<CartView> => {
        const cartId = await repo.findCartId(pool, identity);
        if (cartId === null) {
            return emptyCartView();
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await repo.removeCartItem(client, cartId, productID);
            const view = await repo.getCartView(client, cartId);
            await client.query("COMMIT");
            return view;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const clearCart = async (identity: CartIdentity): Promise<CartView> => {
        const cartId = await repo.findCartId(pool, identity);
        if (cartId === null) {
            return emptyCartView();
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await repo.clearCartItems(client, cartId);
            const view = await repo.getCartView(client, cartId);
            await client.query("COMMIT");
            return view;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const mergeGuestCart = async (userId: number, guestHash: string): Promise<CartView> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const userCartId = await repo.getOrCreateCartId(client, { kind: "user", userId });
            const guestCartId = await repo.findCartId(client, { kind: "guest", guestHash });

            if (guestCartId === null) {
                const view = await repo.getCartView(client, userCartId);
                await client.query("COMMIT");
                return view;
            }

            // Serialize concurrent merges (double login / parallel checkouts).
            await client.query("SELECT id FROM carts WHERE id = $1 FOR UPDATE", [userCartId]);
            await client.query("SELECT id FROM carts WHERE id = $1 FOR UPDATE", [guestCartId]);

            const guestItems = await client.query(
                `SELECT product_id, quantity FROM cart_items WHERE cart_id = $1 ORDER BY id`,
                [guestCartId]
            );
            for (const item of guestItems.rows as { product_id: number; quantity: number }[]) {
                await repo.upsertCartItem(client, userCartId, item.product_id, item.quantity, MAX_QUANTITY);
            }

            await repo.deleteCart(client, guestCartId);
            const view = await repo.getCartView(client, userCartId);

            await client.query("COMMIT");
            return view;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const findOrderByIdempotencyKey = async (key: string) => {
        const result = await pool.query(
            `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                    o.status, o.total, to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o JOIN branches b ON b.id = o.branch_id
             WHERE o.idempotency_key = $1`,
            [key]
        );
        if (result.rows[0] === undefined) {
            return null;
        }
        const itemsResult = await pool.query(
            `SELECT product_id, product_name, unit_price, quantity, subtotal
             FROM order_items WHERE order_id = $1 ORDER BY id`,
            [result.rows[0].id]
        );
        return { ...result.rows[0], items: itemsResult.rows };
    };

    const checkout = async (
        identity: CartIdentity | null,
        input: CheckoutInput
    ): Promise<{ order: unknown }> => {
        if (!input.customerName.trim() || !Number.isInteger(input.branchID) || input.branchID <= 0) {
            throw new CartError("INVALID_INPUT", "Customer name and branch are required");
        }

        // Idempotent replay: a retry with the same key returns the original order
        // without touching the (now-empty) cart.
        if (input.idempotencyKey) {
            const existing = await findOrderByIdempotencyKey(input.idempotencyKey);
            if (existing !== null) {
                return { order: existing };
            }
        }

        const branch = await branchRepository.getBranchByID(input.branchID);
        if (branch === null) {
            throw new CartError("BRANCH_NOT_FOUND", "Invalid branch");
        }

        if (identity === null) {
            throw new CartError("EMPTY_CART", "Cart identity is required");
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const cartId = await repo.findCartId(client, identity);
            if (cartId === null) {
                throw new CartError("EMPTY_CART", "Cart is empty");
            }

            await client.query("SELECT id FROM carts WHERE id = $1 FOR UPDATE", [cartId]);

            const cartItemsResult = await client.query(
                `SELECT product_id, quantity FROM cart_items WHERE cart_id = $1 ORDER BY id`,
                [cartId]
            );
            const cartItems = cartItemsResult.rows as { product_id: number; quantity: number }[];
            if (cartItems.length === 0) {
                throw new CartError("EMPTY_CART", "Cart is empty");
            }

            const productsResult = await client.query<PricedProduct>(
                `SELECT id, name, price, is_available FROM products WHERE id = ANY($1::int[]) AND is_deleted = false`,
                [cartItems.map((item) => item.product_id)]
            );
            const products = productsResult.rows;
            const productById = new Map(products.map((product) => [product.id, product]));

            const unavailable = cartItems
                .filter((item) => !productById.has(item.product_id) || !productById.get(item.product_id)!.is_available)
                .map((item) => item.product_id);
            if (unavailable.length > 0) {
                throw new CartError(
                    "UNAVAILABLE_PRODUCT",
                    "Some items are no longer available",
                    unavailable
                );
            }

            const items = priceOrderItems(
                cartItems.map((item) => ({ productID: item.product_id, quantity: item.quantity })),
                products
            );
            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            const order = await insertOrderAndItems(client, {
                branchID: input.branchID,
                customerName: input.customerName,
                customerPhone: input.customerPhone ?? null,
                total,
                items,
                idempotencyKey: input.idempotencyKey,
            });

            await repo.clearCartItems(client, cartId);

            await client.query("COMMIT");
            return { order };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const getAccountForUser = async (userId: number): Promise<{ name: string; phone: string | null } | null> => {
        const result = await pool.query("SELECT name, phone FROM users WHERE id = $1", [userId]);
        return result.rows[0] ?? null;
    };

    return {
        getCart,
        addItem,
        setItemQuantity,
        removeItem,
        clearCart,
        mergeGuestCart,
        checkout,
        getAccountForUser,
    };
};