import { useQuery } from "@tanstack/react-query";
import { branchApi } from "../services/branchApi";

export const branchInfoKey = (branchId: number) => ["branch", "info", branchId] as const;

/** The signed-in user's branch identity — used for the dashboard sidebar/topbar titles. */
export const useBranchInfo = (branchId: number | null | undefined) =>
    useQuery({
        queryKey: branchInfoKey(branchId ?? 0),
        queryFn: () => branchApi.getBranch(branchId as number),
        enabled: branchId != null,
        staleTime: 5 * 60 * 1000,
    });
