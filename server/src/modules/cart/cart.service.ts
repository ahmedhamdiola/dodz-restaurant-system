import { createHash } from "node:crypto";
import { pool } from "../../config/database.js";
import { BranchRepository } from "../branch/branch.repository.js";
import { insertOrderAndItems, priceOrderItems, PricedItemInput } from "../order/order.repository.js";
import { resolveDeliveryFee } from "../order/order.totals.js";
import { CouponRepository } from "../coupon/coupon.repository.js";
import { CouponService } from "../coupon/coupon.service.js";
import { CouponError } from "../coupon/coupon.types.js";
import { ProductOptionsService, resolveSelection } from "../product/product.options.service.js";
import { RequestedQuantity, SelectedOptionEntry } from "../product/product.options.types.js";
import { CartRepository, emptyCartView } from "./cart.repository.js";
import {
    CartError,
    CartIdentity,
    CartLineOption,
    CartView,
    CheckoutInput,
    MAX_DISTINCT_ITEMS,
    MAX_QUANTITY,
} from "./cart.types.js";

export const hashGuestToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");

interface CartLineRow {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    options_snapshot: CartLineOption[] | null;
}

/** Human-readable checkout failure: names the product and, when known, the option. */
const buildCheckoutFailureMessage = (failures: { productName: string; reason: string }[]): string => {
    if (failures.length === 0) {
        return "Some items are no longer available";
    }
    if (failures.length === 1) {
        return `${failures[0].productName}: ${failures[0].reason}`;
    }
    return `${failures.length} items in your cart are no longer available. Please review your cart.`;
};

const readSnapshotValueIDs = (snapshot: CartLineOption[] | null): number[] => {
    if (!Array.isArray(snapshot)) {
        return [];
    }
    return snapshot
        .map((entry) => Number(entry?.value_id))
        .filter((valueID) => Number.isInteger(valueID) && valueID > 0);
};

/**
 * Counts for counted groups, read back from the stored snapshot.
 *
 * Snapshots written before counted groups existed have no `quantity` field, so
 * they read as 1 -- which keeps a line with no counts validating exactly as it
 * did before.
 */
const readSnapshotQuantities = (snapshot: CartLineOption[] | null): RequestedQuantity[] => {
    if (!Array.isArray(snapshot)) {
        return [];
    }
    const quantities: RequestedQuantity[] = [];
    for (const entry of snapshot) {
        const valueId = Number(entry?.value_id);
        if (!Number.isInteger(valueId) || valueId <= 0) {
            continue;
        }
        const quantity = entry?.quantity === undefined || entry?.quantity === null ? 1 : Number(entry.quantity);
        if (Number.isInteger(quantity) && quantity > 0) {
            quantities.push({ valueId, quantity });
        }
    }
    return quantities;
};

export const CartService = () => {
    const repo = CartRepository();
    const branchRepository = BranchRepository();
    const optionsService = ProductOptionsService();
    const couponRepo = CouponRepository();
    const couponService = CouponService(couponRepo);

    const getCart = async (identity: CartIdentity | null): Promise<CartView> => {
        if (identity === null) {
            return emptyCartView();
        }
        const cartId = await repo.findCartId(pool, identity);
        return cartId === null ? emptyCartView() : repo.getCartView(pool, cartId);
    };

    /**
     * Add (or accumulate) one line.
     *
     * Everything the client sends is treated as a REQUEST, never as truth:
     * the product is re-read, the option ids are re-validated against this
     * product's own option tree, and unit_price is recomputed from
     * products.price + SUM(price_delta) before anything is written.
     */
    const addItem = async (
        identity: CartIdentity,
        productID: number,
        quantity: number,
        optionValueIDs: number[] = [],
        optionQuantities: RequestedQuantity[] = []
    ): Promise<CartView> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const cartId = await repo.getOrCreateCartId(client, identity);
            // Locked so the distinct-item cap below cannot be raced past: without
            // it two concurrent adds both read 49 and both insert, leaving 51.
            await client.query("SELECT id FROM carts WHERE id = $1 FOR UPDATE", [cartId]);

            const { products, trees } = await optionsService.loadSelectionContext(client, [productID]);
            const product = products.get(productID);
            if (product === undefined) {
                throw new CartError("MISSING_PRODUCT", "Product not found");
            }
            if (product.is_modifier) {
                throw new CartError(
                    "UNAVAILABLE_PRODUCT",
                    "This item is only available as a meal option",
                    [productID]
                );
            }
            if (!product.is_available) {
                throw new CartError("UNAVAILABLE_PRODUCT", "Product is not currently available", [productID]);
            }

            const selection = resolveSelection(
                product,
                trees.get(productID) ?? [],
                optionValueIDs,
                "add",
                optionQuantities
            );
            if (!selection.ok) {
                throw new CartError(selection.kind, selection.message);
            }

            const present = await repo.getCartLineQuery(client, cartId, productID, selection.signature);
            if (present.rowCount === 0) {
                const count = await repo.countCartItems(client, cartId);
                if (count >= MAX_DISTINCT_ITEMS) {
                    throw new CartError("CART_FULL", "Cart is full (max 50 different items)");
                }
            }

            await repo.upsertCartItem(
                client,
                cartId,
                {
                    productID,
                    quantity,
                    optionsSignature: selection.signature,
                    optionsSnapshot: selection.snapshot,
                    selectionSummary: selection.summary,
                    unitPrice: selection.unitPrice,
                },
                MAX_QUANTITY
            );
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

    /** Lines are addressed by cart item id: one product can be in the cart many times. */
    const setItemQuantity = async (identity: CartIdentity, cartItemID: number, quantity: number): Promise<CartView> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const cartId = await repo.getOrCreateCartId(client, identity);
            const updated = await repo.setCartItemQuantity(client, cartId, cartItemID, quantity);
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

    const removeItem = async (identity: CartIdentity, cartItemID: number): Promise<CartView> => {
        const cartId = await repo.findCartId(pool, identity);
        if (cartId === null) {
            return emptyCartView();
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await repo.removeCartItem(client, cartId, cartItemID);
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

    /**
     * Absorbs a guest cart into the account cart. Lines are merged on
     * (product_id, options_signature) so two differently customized burgers both
     * survive instead of collapsing into one line.
     */
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

            const guestItems = await client.query<CartLineRow & { options_signature: string; selection_summary: string; unit_price: number }>(
                `SELECT id, product_id, quantity, options_signature, options_snapshot, selection_summary, unit_price
                 FROM cart_items WHERE cart_id = $1 ORDER BY id`,
                [guestCartId]
            );
            for (const item of guestItems.rows) {
                await repo.upsertCartItem(
                    client,
                    userCartId,
                    {
                        productID: item.product_id,
                        quantity: item.quantity,
                        optionsSignature: item.options_signature ?? "",
                        optionsSnapshot: Array.isArray(item.options_snapshot) ? item.options_snapshot : [],
                        selectionSummary: item.selection_summary ?? "",
                        unitPrice: Number(item.unit_price),
                    },
                    MAX_QUANTITY
                );
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
                    o.status, o.order_type, o.subtotal, o.discount_amount, o.delivery_fee,
                    o.coupon_code, o.total, o.delivery_address,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o JOIN branches b ON b.id = o.branch_id
             WHERE o.idempotency_key = $1`,
            [key]
        );
        if (result.rows[0] === undefined) {
            return null;
        }
        const itemsResult = await pool.query(
            `SELECT product_id, product_name, unit_price, quantity, subtotal, options_summary, options_snapshot
             FROM order_items WHERE order_id = $1 ORDER BY id`,
            [result.rows[0].id]
        );
        return { ...result.rows[0], items: itemsResult.rows };
    };

    /**
     * Places the order inside one transaction that RE-VALIDATES and RE-PRICES
     * every line from current DB state. Stored cart prices are never trusted:
     * the product may have been deleted, sold out or repriced, and a selected
     * option may have been removed or marked unavailable since the customer
     * added it. Any failure aborts the whole checkout (409) and names the line.
     */
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

            // A delivery order with nowhere to go is not deliverable, so it is
            // rejected before any line is priced. The pickup branch ignores
            // address fields entirely rather than storing a dead one.
            if (input.orderType === "Delivery") {
                if (!input.deliveryAddress?.trim()) {
                    throw new CartError("INVALID_INPUT", "A delivery address is required");
                }
                if (
                    typeof input.deliveryLat !== "number" ||
                    !Number.isFinite(input.deliveryLat) ||
                    typeof input.deliveryLng !== "number" ||
                    !Number.isFinite(input.deliveryLng)
                ) {
                    throw new CartError("INVALID_INPUT", "Valid delivery coordinates are required");
                }
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

            const cartItemsResult = await client.query<CartLineRow>(
                `SELECT id, product_id, quantity, unit_price, options_snapshot
                 FROM cart_items WHERE cart_id = $1 ORDER BY id`,
                [cartId]
            );
            const cartItems = cartItemsResult.rows;
            if (cartItems.length === 0) {
                throw new CartError("EMPTY_CART", "Cart is empty");
            }

            const productIDs = [...new Set(cartItems.map((item) => item.product_id))];
            const { products, trees } = await optionsService.loadSelectionContext(client, productIDs);

            const failures: { productName: string; reason: string; optionFailure: boolean }[] = [];
            const unavailableProductIds: number[] = [];
            const unavailableCartItemIds: number[] = [];
            const pricedInputs: PricedItemInput[] = [];

            for (const line of cartItems) {
                const product = products.get(line.product_id);
                if (product === undefined) {
                    failures.push({ productName: `Item #${line.product_id}`, reason: "this item is no longer on the menu", optionFailure: false });
                    unavailableProductIds.push(line.product_id);
                    unavailableCartItemIds.push(line.id);
                    continue;
                }
                if (product.is_modifier) {
                    failures.push({ productName: product.name, reason: "this item can only be ordered as a meal option", optionFailure: false });
                    unavailableProductIds.push(line.product_id);
                    unavailableCartItemIds.push(line.id);
                    continue;
                }
                if (!product.is_available) {
                    failures.push({ productName: product.name, reason: "this item is currently unavailable", optionFailure: false });
                    unavailableProductIds.push(line.product_id);
                    unavailableCartItemIds.push(line.id);
                    continue;
                }

                // The value ids and counts come from the stored snapshot, never from the client.
                const valueIDs = readSnapshotValueIDs(line.options_snapshot);
                const selection = resolveSelection(
                    product,
                    trees.get(line.product_id) ?? [],
                    valueIDs,
                    "checkout",
                    readSnapshotQuantities(line.options_snapshot)
                );
                if (!selection.ok) {
                    // Every failure here originates from our OWN stored snapshot,
                    // never from client input, so it is always reported as an
                    // option problem. That matters for a changed piece split: the
                    // customer can fix it, whereas a product-level failure would
                    // tell them the whole item is gone and strip it from the cart.
                    failures.push({ productName: product.name, reason: selection.message, optionFailure: true });
                    unavailableProductIds.push(line.product_id);
                    unavailableCartItemIds.push(line.id);
                    continue;
                }

                // Deliberately re-priced from current DB state even when that RAISES the line:
                // the cart total is only ever a quote, and the order is written from
                // the price that is actually orderable right now.
                pricedInputs.push({
                    productID: selection.productId,
                    quantity: line.quantity,
                    unitPrice: selection.unitPrice,
                    optionsSummary: selection.summary,
                    optionsSnapshot: selection.snapshot as SelectedOptionEntry[],
                });
            }

            if (failures.length > 0) {
                const optionFailure = failures.every((failure) => failure.optionFailure);
                throw new CartError(
                    optionFailure ? "OPTION_UNAVAILABLE" : "UNAVAILABLE_PRODUCT",
                    buildCheckoutFailureMessage(failures),
                    [...new Set(unavailableProductIds)],
                    [...new Set(unavailableCartItemIds)]
                );
            }

            const items = priceOrderItems(
                pricedInputs,
                pricedInputs.map((input) => {
                    const product = products.get(input.productID)!;
                    return { id: product.id, name: product.name, price: Number(product.price), is_available: product.is_available };
                })
            );

            // Read inside the transaction, from the branch that will fulfil the
            // order. The request body carries no fee: it is the customer's own
            // machine, and a client-supplied delivery charge would be free money.
            const feeResult = await client.query(
                `SELECT delivery_fee FROM branches WHERE id = $1 AND is_deleted = false`,
                [input.branchID]
            );
            const deliveryFee = resolveDeliveryFee(input.orderType, feeResult.rows[0]?.delivery_fee);

            // Applied last, after pricing, so the percentage is taken off the real
            // subtotal and a free-delivery coupon can see the real fee. A coupon
            // that has since expired or been spent aborts the whole checkout
            // rather than silently pricing the order without it.
            let discount = 0;
            let appliedCoupon: { id: number; code: string; discount: number } | null = null;
            if (input.couponCode?.trim()) {
                const applied = await couponService.applyCoupon(
                    {
                        couponCode: input.couponCode,
                        subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
                        deliveryFee,
                    },
                    client
                );
                discount = applied.discount;
                appliedCoupon = { id: applied.couponId, code: applied.couponCode, discount: applied.discount };
            }

            const { inserted, order } = await insertOrderAndItems(client, {
                branchID: input.branchID,
                customerName: input.customerName,
                customerPhone: input.customerPhone ?? null,
                orderType: input.orderType,
                deliveryFee,
                discount,
                couponCode: appliedCoupon?.code ?? null,
                deliveryAddress: input.orderType === "Delivery" ? input.deliveryAddress!.trim() : null,
                deliveryLat: input.orderType === "Delivery" ? input.deliveryLat! : null,
                deliveryLng: input.orderType === "Delivery" ? input.deliveryLng! : null,
                items,
                idempotencyKey: input.idempotencyKey,
            });

            if (!inserted) {
                // A concurrent request with this same key won the claim. Its order
                // is the answer, and this transaction's work must not touch the
                // cart — the winner's own checkout already emptied it.
                await client.query("ROLLBACK");
                const existing = await findOrderByIdempotencyKey(input.idempotencyKey!);
                if (existing !== null) {
                    return { order: existing };
                }
                throw new CartError("EMPTY_CART", "Cart is empty");
            }

            if (appliedCoupon !== null) {
                // Recorded after the order claim succeeds, so a losing idempotent
                // retry never counts as a redemption. order_id is UNIQUE, which is
                // what actually enforces one coupon per order.
                await couponRepo.insertOrderCoupon(client, order!.id, appliedCoupon.id, appliedCoupon.discount);
            }

            await repo.clearCartItems(client, cartId);

            await client.query("COMMIT");
            return { order };
        } catch (error) {
            await client.query("ROLLBACK");
            // Surfaced through the cart's own error channel so the storefront gets
            // one consistent shape, and so a spent coupon reads as a conflict to
            // fix rather than a generic 500.
            if (error instanceof CouponError) {
                throw new CartError("INVALID_COUPON", error.message);
            }
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
