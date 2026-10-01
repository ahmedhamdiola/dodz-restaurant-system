import { api, unwrap } from "../../../../lib/api";
import type { ModifierProduct, OptionGroup, OptionsResponse } from "../types";

export const customizeService = {
    /**
     * Read of a product's option tree. `includeUnavailable` is admin-only;
     * the storefront leaves it off so sold-out values never reach the customer.
     */
    getOptions(productID: number, includeUnavailable = false): Promise<OptionGroup[]> {
        return unwrap<OptionsResponse>(
            api.get(`/products/${productID}/options`, { params: { includeUnavailable } })
        ).then((response) => response.options ?? []);
    },

    /**
     * Hidden modifier products (cheese / vegetables / sauces) linkable to option
     * values. They are excluded from `/products`, so both the admin builder and
     * the customizer reach them through this dedicated list.
     */
    getModifiers(): Promise<ModifierProduct[]> {
        return unwrap<ModifierProduct[]>(api.get("/products/options/modifiers"));
    },
};
