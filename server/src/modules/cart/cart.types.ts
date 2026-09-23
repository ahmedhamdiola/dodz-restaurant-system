export interface CartItem {
    product_id: number;
    name: string;
    image: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
    is_available: boolean;
}

export interface CartView {
    items: CartItem[];
    distinct_item_count: number;
    item_count: number;
    subtotal: number;
}

export const MAX_QUANTITY = 99;
export const MAX_DISTINCT_ITEMS = 50;

// Browse-safe raw guest tokens: generated client-side (crypto.randomUUID) and
// stored server-side only as a SHA-256 hash.
export const GUEST_TOKEN_REGEX = /^[A-Za-z0-9_-]{16,128}$/;

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
    | "BRANCH_NOT_FOUND";

export class CartError extends Error {
    constructor(public type: CartErrorType, message: string, public unavailableProductIds?: number[]) {
        super(message);
        this.name = "CartError";
    }
}