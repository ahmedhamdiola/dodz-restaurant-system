import { useGetOptionModifiersQuery, useGetProductOptionsQuery } from "../../products/customize/redux/customizeApi";
import type { ModifierProduct } from "../../products/customize/types";

export type { ModifierProduct };

/**
 * Admin read of one product's option tree. Sold-out groups/values are included so
 * nothing the admin configured ever disappears from the builder.
 */
export const useAdminProductOptions = (productID: number | null) =>
    useGetProductOptionsQuery(
        { productID: productID ?? 0, includeUnavailable: true },
        { skip: productID === null || productID <= 0 }
    );

/**
 * Hidden modifier products. They are excluded from `/products`, so the builder
 * reaches them through this dedicated, searchable list.
 */
export const useOptionModifiers = (enabled: boolean) =>
    useGetOptionModifiersQuery(undefined, { skip: !enabled });
