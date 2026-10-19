import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../components/toast/context";
import { branchApi } from "../../branch/services/branchApi";
import { branchAlertKeys } from "../../branch/hooks/useBranchAlerts";
import type { BranchAlertStatus } from "../../branch/types";

export const adminAlertKeys = {
    list: (filters: { status?: BranchAlertStatus; branchId?: number }) =>
        ["admin", "alerts", "list", { status: filters.status ?? "all", branchId: filters.branchId ?? "all" }] as const,
};

/** Main-admin inbox, optionally filtered by status and branch. */
export const useAdminAlerts = (filters: { status?: BranchAlertStatus; branchId?: number } = {}, enabled = true) =>
    useQuery({
        queryKey: adminAlertKeys.list(filters),
        queryFn: () => branchApi.getAlerts(filters),
        enabled,
    });

export const usePendingAlertCount = (enabled = true) =>
    useQuery({
        queryKey: branchAlertKeys.pendingCount,
        queryFn: branchApi.getPendingCount,
        enabled,
    });

export const useUpdateAlertStatus = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: "acknowledged" | "resolved" }) =>
            branchApi.updateAlertStatus(id, status),
        onSuccess: (alert) => {
            toast.success(alert.status === "resolved" ? "Alert resolved" : "Alert acknowledged");
            queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
            queryClient.invalidateQueries({ queryKey: branchAlertKeys.pendingCount });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not update the alert");
        },
    });
};
