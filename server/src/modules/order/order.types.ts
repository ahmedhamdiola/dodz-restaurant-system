export type { OrderType, OrderTotals } from "./order.totals.js";
import type { OrderType } from "./order.totals.js";

export type OrderStatus = "Completed" | "Preparing" | "On the way" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["Completed", "Preparing", "On the way", "Cancelled"];

// Forward-only transitions. Completed and Cancelled are terminal.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    Preparing: ["On the way", "Completed", "Cancelled"],
    "On the way": ["Completed", "Cancelled"],
    Completed: [],
    Cancelled: [],
};

export const canTransitionTo = (from: OrderStatus, to: OrderStatus): boolean =>
    from === to || NEXT_STATUSES[from].includes(to);

export interface OrderItemInput {
    productID: number;
    quantity: number;
}

export interface OrderInput {
    branchID: number;
    customerName: string;
    customerPhone?: string;
    /** Absent means Pickup, so pre-delivery callers keep working unchanged. */
    orderType?: OrderType;
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    items: OrderItemInput[];
}

export interface OrderFilters {
    branchID?: number;
    status?: OrderStatus;
    customerPhone?: string;
}