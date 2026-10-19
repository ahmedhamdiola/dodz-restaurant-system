import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../components/toast/context";
import { MENU_STALE_TIME } from "../../menu/queryKeys";
import { branchApi } from "../services/branchApi";

export const branchKeys = {
    stock: (branchId: number) => ["branch", "stock", branchId] as const,
    alerts: ["branch", "alerts"] as const,
    pendingCount: ["branch", "alerts", "pending-count"] as const,
};

/** The branch's full menu with its own counts. Disabled until the branch is known. */
export const useBranchStock = (branchId: number | null) =>
    useQuery({
        queryKey: branchKeys.stock(branchId ?? 0),
        queryFn: () => branchApi.getStock(branchId as number),
        enabled: branchId !== null,
        staleTime: MENU_STALE_TIME,
    });

export const useUpdateStock = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({
            branchId,
            productId,
            update,
        }: {
            branchId: number;
            productId: number;
            update: { quantity: number; lowStockThreshold?: number };
        }) => branchApi.setStock(branchId, productId, update),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["branch", "stock", variables.branchId] });
            toast.success("Stock updated");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not update stock");
        },
    });
};
