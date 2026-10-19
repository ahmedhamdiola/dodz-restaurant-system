import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../components/toast/context";
import { MENU_STALE_TIME } from "../../menu/queryKeys";
import { ordersApi } from "../services/ordersApi";
import { couponsApi } from "../services/couponsApi";
import type { CouponInput, OrderStatus, OrdersFilters } from "../types";

export const adminKeys = {
    branches: ["admin", "branches"] as const,
    orderCounts: ["admin", "orders", "counts"] as const,
    orderStats: (branchId?: number) =>
        ["admin", "orders", "stats", branchId ?? "all"] as const,
    orderList: (filters: OrdersFilters) =>
        ["admin", "orders", "list", { branchId: filters.branchId ?? "all", status: filters.status ?? "all" }] as const,
};

export const useBranches = () =>
    useQuery({
        queryKey: adminKeys.branches,
        queryFn: ordersApi.getBranches,
        staleTime: MENU_STALE_TIME,
    });

export const useOrdersCountByBranch = () =>
    useQuery({
        queryKey: adminKeys.orderCounts,
        queryFn: ordersApi.getOrdersCountByBranch,
        staleTime: MENU_STALE_TIME,
    });

export const useOrderStats = (branchId?: number) =>
    useQuery({
        queryKey: adminKeys.orderStats(branchId),
        queryFn: () => ordersApi.getOrderStats(branchId),
        staleTime: MENU_STALE_TIME,
    });

export const useOrders = (filters: OrdersFilters, enabled = true) =>
    useQuery({
        queryKey: adminKeys.orderList(filters),
        queryFn: () => ordersApi.getOrders(filters),
        staleTime: MENU_STALE_TIME,
        enabled,
    });

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
            ordersApi.updateOrderStatus(id, status),
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            queryClient.invalidateQueries({ queryKey: ["profile", "orders"] });
        },
        onError: () => {
            toast.error("Could not update the order status");
        },
    });
};
export const useCoupons = () =>
    useQuery({
        queryKey: ["admin", "coupons"],
        queryFn: couponsApi.getCoupons,
        staleTime: MENU_STALE_TIME,
    });

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (input: CouponInput) => couponsApi.createCoupon(input),
        onSuccess: () => {
            toast.success("Coupon created");
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: CouponInput }) =>
            couponsApi.updateCoupon(id, input),
        onSuccess: () => {
            toast.success("Coupon updated");
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (id: number) => couponsApi.deleteCoupon(id),
        onSuccess: () => {
            toast.success("Coupon deleted");
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
        onError: () => {
            toast.error("Could not delete the coupon");
        },
    });
};
