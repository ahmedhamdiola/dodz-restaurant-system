import { useGetProductOptionsQuery } from "../redux/customizeApi";

/**
 * Option tree for the product currently being customized. Disabled until a real
 * product id is known so the request never fires for the empty shell state.
 *
 * Reads through the RTK slice, so the customizer and the cart's option-aware add
 * share one cache and one invalidation path.
 */
export const useProductOptions = (productID: number | null) =>
    useGetProductOptionsQuery(
        { productID: productID ?? 0, includeUnavailable: false },
        { skip: productID === null || productID <= 0 }
    );
