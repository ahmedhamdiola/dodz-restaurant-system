/**
 * Types for the "Customize Your Meal" option tree and for the authoritative
 * selection resolution that the cart (add-to-cart) and checkout both run.
 *
 * Naming note: the API contract is snake_case on the wire, so these interfaces
 * are declared in wire shape. Internal option *inputs* (admin payloads) are
 * snake_case too, which keeps the repository free of rename maps.
 */

/**
 * "quantity" groups are counted rather than picked: each value carries a count
 * and the group is linked to a partner group, so the pair's counts must add up to
 * `linked_total` (e.g. 12 pieces split as 8 Original + 4 Spicy).
 */
export type OptionType = "radio" | "checkbox" | "quantity";

/** The hidden modifier product an option value physically represents. */
export interface OptionValueModifier {
    id: number;
    name: string;
    image: string;
    price: number;
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
    modifier: OptionValueModifier | null;
}

export interface OptionGroup {
    id: number;
    product_id: number;
    name: string;
    type: OptionType;
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

// ------------------------------------------------------------------ admin input

export interface OptionValueInput {
    id?: number;
    name: string;
    description?: string | null;
    price_delta: number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
    modifier_product_id?: number | null;
}

export interface OptionGroupInput {
    id?: number;
    name: string;
    type: OptionType;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    is_available: boolean;
    /** "quantity" groups only: link to the partner group and fix the pair total. */
    linked_group_id?: number | null;
    linked_total?: number | null;
    unit_label?: string | null;
    values: OptionValueInput[];
}

export interface OptionTreeInput {
    options: OptionGroupInput[];
}

export interface OptionValuePatch {
    is_available?: boolean;
    price_delta?: number;
    is_default?: boolean;
}

/** A modifier product, as shown in the admin value picker. */
export interface ModifierProduct {
    id: number;
    name: string;
    image: string;
    price: number;
    category_name: string;
    is_available: boolean;
}

// ------------------------------------------------------------------ selection

/** One resolved selection, persisted in cart_items / order_items snapshots. */
export interface SelectedOptionEntry {
    option_id: number;
    option_name: string;
    value_id: number;
    value_name: string;
    price_delta: number;
    /** Count for a "quantity" group value; 1 for ordinary picked values. */
    quantity: number;
}

/** A count the customer set on a single "quantity" group value. */
export interface RequestedQuantity {
    valueId: number;
    quantity: number;
}

export type SelectionFailureKind = "INVALID_OPTIONS" | "OPTION_UNAVAILABLE";

export interface SelectionFailure {
    ok: false;
    kind: SelectionFailureKind;
    /** Human-readable, names the failing group so the UI can render it inline. */
    message: string;
    productId: number;
    optionId: number | null;
}

export interface SelectionSuccess {
    ok: true;
    productId: number;
    productName: string;
    /** Sorted, de-duplicated value ids. */
    valueIds: number[];
    /** Resolved counts for every "quantity" group, sorted by value id. */
    quantities: RequestedQuantity[];
    /**
     * SHA-256 hex identifying the exact configuration; '' when nothing is
     * selected. Includes counts, so "6 spicy" and "4 spicy" are distinct lines.
     */
    signature: string;
    snapshot: SelectedOptionEntry[];
    summary: string;
    /** products.price + SUM(price_delta * quantity), computed server-side. */
    unitPrice: number;
    basePrice: number;
    optionsTotal: number;
}

export type SelectionResult = SelectionSuccess | SelectionFailure;

/** Product row needed to price a selection. */
export interface SelectableProduct {
    id: number;
    name: string;
    price: number;
    is_available: boolean;
    is_modifier: boolean;
}

export type SelectionMode = "add" | "checkout";

export const MAX_OPTION_GROUPS = 12;
export const MAX_VALUES_PER_GROUP = 60;
export const MAX_NAME_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 500;
/**
 * Ceilings on the numbers an admin can author. Without them a `price_delta` of
 * 1e30 or a `linked_total` of 1e9 passes validation and then overflows NUMERIC(10,2)
 * on insert, which surfaces as an opaque 500 instead of a clean 400.
 */
export const MAX_PRICE_DELTA = 100_000;
export const MAX_LINKED_TOTAL = 1_000;
