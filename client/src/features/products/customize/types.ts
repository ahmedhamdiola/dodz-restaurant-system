/**
 * Shared shapes for the product-customization tree. The customer modal and the
 * admin option-group builder both speak this vocabulary, so the field names
 * mirror the API contract verbatim (snake_case).
 */

/**
 * "quantity" groups are counted rather than picked: each value carries a count
 * and the group is linked to a partner group, so the pair's counts must add up to
 * `linked_total` (e.g. 12 pieces split as 8 Original + 4 Spicy).
 */
export type OptionGroupType = "radio" | "checkbox" | "quantity";

/** The compact modifier product nested inside an option value (public payload). */
export interface OptionModifier {
    id: number;
    name: string;
    image: string;
    price: number;
}

/** A hidden modifier product that can be linked to an option value (admin list). */
export interface ModifierProduct {
    id: number;
    name: string;
    image: string;
    price: number;
    category_name: string;
    is_available: boolean;
}

export interface OptionValue {
    id: number;
    option_id: number;
    name: string;
    description: string | null;
    price_delta: number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
    modifier_product_id: number | null;
    modifier: OptionModifier | null;
}

export interface OptionGroup {
    id: number;
    product_id: number;
    name: string;
    type: OptionGroupType;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    is_available: boolean;
    /** "quantity" groups only: the partner group's counts complete this group's. */
    linked_group_id: number | null;
    /** "quantity" groups only: the fixed combined count both groups must reach. */
    linked_total: number | null;
    /** "quantity" groups only: label for one unit, e.g. "pieces". */
    unit_label: string | null;
    values: OptionValue[];
}

/** `GET /products/:id/options` response body. */
export interface OptionsResponse {
    options: OptionGroup[];
}

/** Selected value ids, keyed by option group id. Radio groups hold 0 or 1. */
export type SelectionMap = Record<number, number[]>;

/**
 * Counts for "quantity" groups, keyed by option VALUE id. Kept separate from
 * SelectionMap because a count is not a pick: 8 spicy pieces select the same
 * value as 1 spicy piece.
 */
export type QuantityMap = Record<number, number>;

/** A count as sent to `POST /cart/items`. */
export interface OptionQuantity {
    valueId: number;
    quantity: number;
}

/** Product identity the modal needs before its options query resolves. */
export interface CustomizeTarget {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
}
