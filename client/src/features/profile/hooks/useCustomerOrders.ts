import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../admin/services/ordersApi";
import type { AdminOrder } from "../../admin/types";
import { MENU_STALE_TIME } from "../../menu/queryKeys";
import type { PastOrder } from "../types";

const toPastOrder = (order: AdminOrder): PastOrder => ({
    id: order.id,
    date: order.date,
    branchName: order.branchName,
    items: order.items,
    total: order.total,
    status: order.status,
});

/**
 * Loads the authenticated user's past orders. The phone number is resolved
 * server-side from the JWT (GET /orders/my), never from a client-supplied
 * value. Enabled only once the page knows the user is actually signed in.
 */
export const useCustomerOrders = (enabled: boolean) => {
    return useQuery({
        queryKey: ["profile", "orders"],
        queryFn: async () => {
            const orders = await ordersApi.getMyOrders();
            return orders.map(toPastOrder);
        },
        enabled,
        staleTime: MENU_STALE_TIME,
    });
};