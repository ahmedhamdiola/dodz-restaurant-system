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
    total: number;
    created_at: string;
    items: CartLineItem[];
}

export interface CheckoutPayload {
    branchID: number;
    customerName?: string;
    customerPhone?: string;
    idempotencyKey?: string;
}

export const MAX_QUANTITY = 99;

export const isCartView = (value: unknown): value is CartView => {
    if (typeof value !== "object" || value === null) return false;
    const cart = value as CartView;
    return Array.isArray(cart.items) && typeof cart.subtotal === "number";
};