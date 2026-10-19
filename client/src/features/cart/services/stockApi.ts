import { api, unwrap } from "../../../lib/api";

/**
 * Per-product availability for one branch. The server answers with a bare
 * boolean per product — exact counts are admin-only data — so this is used to
 * flag cart lines the kitchen cannot fill right now.
 */
export interface ProductAvailability {
    productId: number;
    available: boolean;
}

export const stockService = {
    availability(branchId: number, productIds: number[]): Promise<ProductAvailability[]> {
        return unwrap<ProductAvailability[]>(
            api.get(`/stock/branch/${branchId}/available`, {
                params: { productIds: productIds.join(",") },
            })
        );
    },
};
