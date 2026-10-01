import { SelectedOptionEntry } from "../product/product.options.types.js";

/** One selected option value, as echoed back to the storefront. */
export type CartLineOption = SelectedOptionEntry;

/**
 * A cart line. Identity is the CART ITEM id, not the product: one product can
 * sit in the cart several times with different customizations, so the line
 * addressable by the client is cart_items.id.
 */
export interface CartLine {
    id: number;
    product_id: number;
    name: string;
    image: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    is_available: boolean;
    options_signature: string;
    selection_summary: string;
    options: CartLineOption[];
}

export type CartItem = CartLine;

export interface CartView {
    items: CartLine[];
    distinct_item_count: number;
    item_count: number;
    subtotal: number;
}

export const MAX_QUANTITY = 99;
export const MAX_DISTINCT_ITEMS = 50;
export const MAX_OPTION_VALUE_IDS = 60;

// Browse-safe raw guest tokens: generated client-side (crypto.randomUUID) and
// stored server-side only as a SHA-256 hash.
export const GUEST_TOKEN_REGEX = /^[A-Za-z0-9_-]{16,128}$/;

// Order-replay keys, validated on their own schedule. This looks like the guest
// token rule but must not borrow it: `orders.idempotency_key` is VARCHAR(64), so
// a 128-character "valid" key would be stored fine and then rejected by Postgres
// as a value-too-long error. 16+ URL-safe characters keeps the brute-force space
// large while fitting the column with room to spare.
export const IDEMPOTENCY_KEY_REGEX = /^[A-Za-z0-9_-]{16,64}$/;

export type CartIdentity =
    | { kind: "user"; userId: number }
    | { kind: "guest"; guestHash: string };

export interface CheckoutInput {
    branchID: number;
    customerName: string;
    customerPhone?: string;
    idempotencyKey?: string;
}

export type CartErrorType =
    | "INVALID_INPUT"
    | "MISSING_PRODUCT"
    | "UNAVAILABLE_PRODUCT"
    | "EMPTY_CART"
    | "CART_FULL"
    | "CART_NOT_FOUND"
    | "INVALID_GUEST_TOKEN"
    | "BRANCH_NOT_FOUND"
    // "Customize Your Meal": 400 when the selection itself is wrong, 409 when a
    // selected option exists but is no longer orderable.
    | "INVALID_OPTIONS"
    | "OPTION_UNAVAILABLE";

export class CartError extends Error {
    constructor(
        public type: CartErrorType,
        message: string,
        public unavailableProductIds?: number[],
        /** Which cart lines failed re-validation, so the UI can point at the exact line. */
        public unavailableCartItemIds?: number[]
    ) {
        super(message);
        this.name = "CartError";
    }
}
