/** A single option value attached to a cart line (mirrors the API payload). */
export interface CartLineOption {
    option_id: number;
    option_name: string;
    value_id: number;
    value_name: string;
    price_delta: number;
}

/**
 * One configured cart line. `id` is the cart line identifier (NOT the product
 * id): a single product can appear several times with different selections.
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

export interface CartView {
    items: CartLine[];
    distinct_item_count: number;
    item_count: number;
    subtotal: number;
}

export interface CartLineItem {
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

export interface OrderView {
    id: number;
    branch_id: number;
    branch_name: string;
    customer_name: string;
    customer_phone: string | null;
    status: string;
    order_type: string;
    subtotal: number;
    discount_amount: number;
    delivery_fee: number;
    coupon_code?: string | null;
    total: number;
    delivery_address?: string | null;
    created_at: string;
    items: CartLineItem[];
}

export type OrderType = "Delivery" | "Pickup";

export interface CheckoutPayload {
    branchID: number;
    customerName?: string;
    customerPhone?: string;
    orderType: OrderType;
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    idempotencyKey?: string;
}

/** Body of `POST /cart/items`; `optionValueIDs` configures the line. */
export interface AddItemPayload {
    productID: number;
    quantity?: number;
    optionValueIDs?: number[];
    /**
     * Counts for "quantity" option groups. Additive and optional, so a client
     * that never sends it keeps working unchanged.
     */
    optionQuantities?: { valueId: number; quantity: number }[];
}

export const MAX_QUANTITY = 99;

export const isCartView = (value: unknown): value is CartView => {
    if (typeof value !== "object" || value === null) return false;
    const cart = value as CartView;
    return Array.isArray(cart.items) && typeof cart.subtotal === "number";
};
