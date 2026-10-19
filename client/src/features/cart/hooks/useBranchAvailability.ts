import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrderType } from "../../order/useOrderType";
import { useOrderLocation } from "../../order-location/useOrderLocation";
import { stockService } from "../services/stockApi";
import { useCart } from "./useCart";

/**
 * Availability is cheap to ask about but not free, and the server hides the
 * counts, so a short stale window keeps the open-cart case off the wire while
 * still catching a sell-out after the customer closes and reopens the cart.
 */
export const AVAILABILITY_STALE_TIME = 30_000;

/** Root of every availability key, so a whole-branch invalidation is one call. */
export const AVAILABILITY_QUERY_ROOT = "branch-availability";

export const availabilityKey = (branchId: number | null, productIds: number[]) =>
    [AVAILABILITY_QUERY_ROOT, branchId, productIds] as const;

/**
 * Which products in the current cart the selected branch can actually fill.
 *
 * The lookup only runs once a branch is chosen for the active order mode (a
 * selection made under the other mode — a pickup branch while the navbar says
 * Delivery — is not what checkout will use) and there is at least one line.
 */
export const useBranchAvailability = () => {
    const { data: cart } = useCart();
    const { isDelivery } = useOrderType();
    const { selection } = useOrderLocation();

    const activeSelection =
        selection?.mode === (isDelivery ? "delivery" : "pickup") ? selection : null;
    const branchId = activeSelection?.branchId ?? null;

    // Availability is per product, so a product with several customised lines is
    // asked about once.
    const productIds = useMemo(() => {
        const ids = new Set<number>();
        for (const item of cart?.items ?? []) {
            ids.add(item.product_id);
        }
        return [...ids].sort((a, b) => a - b);
    }, [cart]);

    const enabled = branchId !== null && productIds.length > 0;
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: availabilityKey(branchId, productIds),
        queryFn: () => stockService.availability(branchId as number, productIds),
        enabled,
        staleTime: AVAILABILITY_STALE_TIME,
    });

    const unavailableIds = useMemo(() => {
        const ids = new Set<number>();
        if (!enabled) return ids;
        for (const row of data ?? []) {
            if (!row.available) ids.add(row.productId);
        }
        return ids;
    }, [data, enabled]);

    return {
        /** True only for products the branch cannot fill; unknown = available. */
        isUnavailable: (productId: number) => unavailableIds.has(productId),
        unavailableCount: unavailableIds.size,
        /** True while the first answer for this cart is still on its way. */
        isLoading: enabled && isLoading,
        isFetching,
        /** True until every line has been confirmed against the branch. */
        isBlocked: unavailableIds.size > 0,
        refetch,
    };
};
