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
 * Loads the authenticated user's past orders (matched by the phone number on
 * their account). Disabled when the account has no phone, so the consumer can
 * rely on `data ?? []` falling back to an empty state.
 */
export const useCustomerOrders = (phone: string | null | undefined) => {
    return useQuery({
        queryKey: ["profile", "orders", phone ?? null],
        queryFn: async () => {
            const orders = await ordersApi.getOrders({ customerPhone: phone ?? undefined });
            return orders.map(toPastOrder);
        },
        enabled: Boolean(phone),
        staleTime: MENU_STALE_TIME,
    });
};