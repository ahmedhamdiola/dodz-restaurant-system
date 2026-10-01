import { api, unwrap } from "../../../lib/api";
import type {
    OptionGroup,
    OptionGroupType,
    OptionsResponse,
} from "../../products/customize/types";

/** Wire shape of one option value inside a full-replace payload. */
export interface OptionValuePayload {
    id?: number;
    name: string;
    description?: string;
    price_delta: number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
    modifier_product_id?: number;
}

export interface OptionGroupPayload {
    id?: number;
    name: string;
    type: OptionGroupType;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    is_available: boolean;
    /** "quantity" groups only: partner by saved id. */
    linked_group_id?: number | null;
    /** "quantity" groups only: partner by sibling index, for a brand-new pair. */
    linked_to_index?: number;
    /** "quantity" groups only: the fixed count the pair must reach. */
    linked_total?: number;
    /** "quantity" groups only: label for one unit, e.g. "pieces". */
    unit_label?: string;
    values: OptionValuePayload[];
}

export interface ReplaceOptionsPayload {
    options: OptionGroupPayload[];
}

export const optionsApi = {
    /**
     * Full replace of the product's option tree in a single request. Groups and
     * values keep their `id` when they already exist, so untouched rows are
     * updated rather than recreated (and their server ids survive).
     *
     * Reads live in `customizeService` and are served by the RTK slice; this
     * service is only the admin's write path.
     */
    replaceOptions(productID: number, payload: ReplaceOptionsPayload): Promise<OptionGroup[]> {
        return unwrap<OptionsResponse>(
            api.put(`/products/${productID}/options`, payload)
        ).then((response) => response.options ?? []);
    },
};
