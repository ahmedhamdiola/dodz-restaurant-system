import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../components/toast/context";
import { branchApi } from "../services/branchApi";
import type { SendAlertInput } from "../types";

export const branchAlertKeys = {
    list: ["branch", "alerts", "list"] as const,
    pendingCount: ["branch", "alerts", "pending-count"] as const,
};

/** The caller's alert inbox (all branches for a main admin). */
export const useAlerts = (enabled = true) =>
    useQuery({
        queryKey: branchAlertKeys.list,
        queryFn: () => branchApi.getAlerts(),
        enabled,
    });

export const usePendingAlertCount = (enabled = true) =>
    useQuery({
        queryKey: branchAlertKeys.pendingCount,
        queryFn: branchApi.getPendingCount,
        enabled,
    });

export const useSendAlert = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (input: SendAlertInput) => branchApi.sendAlert(input),
        onSuccess: () => {
            toast.success("Alert sent to the main office");
            queryClient.invalidateQueries({ queryKey: ["branch", "alerts"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not send the alert");
        },
    });
};
