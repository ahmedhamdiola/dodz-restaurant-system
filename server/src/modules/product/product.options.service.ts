import { createHash } from "node:crypto";
import { Pool, PoolClient } from "pg";
import { pool } from "../../config/database.js";
import { ProductOptionsRepository } from "./product.options.repository.js";
import {
    MAX_DESCRIPTION_LENGTH,
    MAX_LINKED_TOTAL,
    MAX_NAME_LENGTH,
    MAX_OPTION_GROUPS,
    MAX_PRICE_DELTA,
    MAX_VALUES_PER_GROUP,
    ModifierProduct,
    OptionGroup,
    OptionType,
    OptionValue,
    RequestedQuantity,
    SelectableProduct,
    SelectionMode,
    SelectionResult,
} from "./product.options.types.js";

type Db = Pool | PoolClient;

export class ProductOptionsError extends Error {
    constructor(public type: "NOT_FOUND" | "INVALID", message: string) {
        super(message);
        this.name = "ProductOptionsError";
    }
}

// ------------------------------------------------------------------ money

/** Prices are 2dp money; all arithmetic runs in integer piastres to avoid float drift. */
const toCents = (value: number): number => Math.round(Number(value) * 100);
const fromCents = (cents: number): number => cents / 100;

/** "topping" -> "toppings", "sauce" -> "sauces" (good enough for UI copy). */
const pluralize = (word: string): string => {
    const trimmed = word.trim();
    // Already plural (or one of the sibilant endings that is its own plural):
    // "toppings" must not become "toppingses", and "glass" stays "glass".
    if (/s$/i.test(trimmed)) return trimmed;
    if (/(x|z|ch|sh)$/i.test(trimmed)) return `${trimmed}es`;
    if (/[^aeiou]y$/i.test(trimmed)) return `${trimmed.slice(0, -1)}ies`;
    return `${trimmed}s`;
};

const countLabel = (count: number, word: string): string =>
    `${count} ${count === 1 ? word.trim() : pluralize(word)}`;

// ------------------------------------------------------------------ signatures

/**
 * SHA-256 hex identifying one exact configuration, so two lines only merge when
 * they are genuinely the same item.
 *
 * Counts MUST be part of the signature. A 12-piece meal as 8/4 and the same meal
 * as 6/6 select the same value ids, so an id-only signature would silently merge
 * them into a single cart line and lose the customer's split.
 *
 * The id-only string is kept byte-identical when there are no counts, so existing
 * non-counted lines keep merging with each other exactly as before.
 */
export const buildOptionsSignature = (
    valueIDs: number[],
    quantities: { valueId: number; quantity: number }[] = []
): string => {
    const normalized = [...new Set(valueIDs)].sort((a, b) => a - b);
    if (normalized.length === 0) {
        return "";
    }
    const counts = [...new Map(quantities.map((q) => [q.valueId, q.quantity])).entries()]
        .filter(([, quantity]) => quantity > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([valueId, quantity]) => `${valueId}x${quantity}`)
        .join(",");

    if (counts.length === 0) {
        return createHash("sha256").update(normalized.join(",")).digest("hex");
    }

    return createHash("sha256").update(`${normalized.join(",")}|${counts}`).digest("hex");
};

/**
 * Human-readable line description: just the chosen options, comma separated.
 *
 *   "Toasted Brioche Bun, American Cheese, Comeback Sauce"
 *
 * Group titles are deliberately omitted ("Cheese · American Cheese" reads worse on
 * a cart line and a kitchen ticket than the bare value). The grouping is not lost:
 * `options_snapshot` keeps each selection's `option_name` alongside its
 * `value_name`, so anything that needs the structure still has it.
 *
 * Names are de-duplicated because two different groups may offer a value with the
 * same name, and repeating it reads as a mistake.
 */
export const buildSelectionSummary = (snapshot: { value_name: string; quantity?: number }[]): string => {
    const names = new Set<string>();
    for (const entry of snapshot) {
        if (entry.value_name) {
            // A count is what makes "Original 8" different from "Original 4",
            // so it is part of the label, not just an implementation detail.
            const quantity = entry.quantity ?? 1;
            names.add(quantity === 1 ? entry.value_name : `${entry.value_name} ×${quantity}`);
        }
    }
    return [...names].join(", ");
};

// ------------------------------------------------------------------ selection

/**
 * Authoritative validation + pricing of one product's option selection.
 *
 * Never trusts the client: ids must belong to THIS product, must be available,
 * and the resulting price is always recomputed from products.price +
 * SUM(price_delta).
 *
 * `mode`:
 *   "add"      -> ids the client sent that we cannot attribute to a group are
 *                 a client error (INVALID_OPTIONS / 400).
 *   "checkout" -> ids that no longer resolve mean the option was deleted or
 *                 re-pointed since the customer added it (OPTION_UNAVAILABLE / 409).
 */
export const resolveSelection = (
    product: SelectableProduct,
    tree: OptionGroup[],
    requestedValueIDs: number[],
    mode: SelectionMode,
    requestedQuantities: RequestedQuantity[] = []
): SelectionResult => {
    const productId = product.id;
    const fail = (kind: "INVALID_OPTIONS" | "OPTION_UNAVAILABLE", message: string, optionId: number | null = null) => ({
        ok: false as const,
        kind,
        message,
        productId,
        optionId,
    });

    if (new Set(requestedValueIDs).size !== requestedValueIDs.length) {
        return fail("INVALID_OPTIONS", "The same option was selected more than once");
    }
    if (new Set(requestedQuantities.map((q) => q.valueId)).size !== requestedQuantities.length) {
        return fail("INVALID_OPTIONS", "The same option was counted more than once");
    }

    // Products without an option tree must not be sent selections.
    if (tree.length === 0) {
        if (requestedValueIDs.length > 0 || requestedQuantities.length > 0) {
            return fail("INVALID_OPTIONS", "This item cannot be customized");
        }
        return {
            ok: true,
            productId,
            productName: product.name,
            valueIds: [],
            quantities: [],
            signature: "",
            snapshot: [],
            summary: "",
            unitPrice: fromCents(toCents(product.price)),
            basePrice: fromCents(toCents(product.price)),
            optionsTotal: 0,
        };
    }

    // Index: value id -> owning group + value.
    const index = new Map<number, { group: OptionGroup; value: OptionValue }>();
    for (const group of tree) {
        for (const value of group.values) {
            index.set(value.id, { group, value });
        }
    }

    const quantityGroups = tree.filter((group) => group.type === "quantity");
    const quantityGroupIds = new Set(quantityGroups.map((group) => group.id));

    /**
     * The list of values treated as plain picks.
     *
     * Our own stored snapshot records EVERY chosen value, counted ones included, so
     * at checkout a counted value legitimately arrives in both lists. Taking it as a
     * pick as well would make "must be set with a quantity, not selected" fire on
     * the server's own data and 409 every piece-mix line the moment it was paid for.
     * A customer cannot be blamed for a shape we wrote.
     */
    const pickedValueIDs =
        mode === "checkout"
            ? requestedValueIDs.filter((valueID) => !quantityGroupIds.has(index.get(valueID)?.group.id ?? -1))
            : requestedValueIDs;

    const chosen = new Set<number>();
    for (const valueID of pickedValueIDs) {
        const hit = index.get(valueID);
        if (!hit) {
            return mode === "checkout"
                ? fail("OPTION_UNAVAILABLE", "A selected option is no longer offered")
                : fail("INVALID_OPTIONS", "Some selected options are not valid for this item");
        }
        if (!hit.value.is_available) {
            return fail(
                "OPTION_UNAVAILABLE",
                `"${hit.value.name}" is sold out. Please choose a different ${hit.group.name.toLowerCase()}.`,
                hit.group.id
            );
        }
        if (!hit.group.is_available) {
            return fail(
                "OPTION_UNAVAILABLE",
                `"${hit.group.name}" is no longer offered. Please remove it to continue.`,
                hit.group.id
            );
        }
        chosen.add(valueID);
    }

    // A counted value must never arrive as a plain pick, and vice versa. Mixing
    // them would make "8 original" ambiguous (selected once? counted 8?). Checkout
    // is exempt via `pickedValueIDs` above: our own snapshot carries both.
    for (const valueID of pickedValueIDs) {
        if (quantityGroupIds.has(index.get(valueID)?.group.id ?? -1)) {
            return fail("INVALID_OPTIONS", "Some options must be set with a quantity, not selected");
        }
    }
    for (const { valueId } of requestedQuantities) {
        if (!quantityGroupIds.has(index.get(valueId)?.group.id ?? -1)) {
            // "add" is the client telling us it counted something pickable, which
            // is always a mistake. "checkout" is our own stored snapshot, where
            // every ordinary pick is recorded with quantity 1, so those are simply
            // dropped rather than rejected.
            if (mode === "checkout") {
                continue;
            }
            return fail("INVALID_OPTIONS", "Some counted options are not valid for this item");
        }
    }

    // Only counts that belong to a counted group take part in validation.
    const counts = mode === "checkout" ? requestedQuantities.filter((q) => quantityGroupIds.has(index.get(q.valueId)?.group.id ?? -1)) : requestedQuantities;

    const snapshot: {
        option_id: number;
        option_name: string;
        value_id: number;
        value_name: string;
        price_delta: number;
        quantity: number;
    }[] = [];
    let totalCents = toCents(product.price);

    /** Resolved counts per value id, restricted to the given group. */
    const countsFor = (group: OptionGroup): Map<number, number> => {
        const resolved = new Map<number, number>();
        for (const value of group.values) {
            resolved.set(value.id, 0);
        }
        for (const { valueId, quantity } of counts) {
            if (resolved.has(valueId)) {
                resolved.set(valueId, quantity);
            }
        }
        return resolved;
    };

    for (const group of tree) {
        // A group an admin has switched off is simply not part of the meal. The
        // storefront never renders it, so enforcing it here would make the whole
        // product unbuyable over a control the customer cannot even see.
        if (!group.is_available) {
            continue;
        }
        if (group.type === "quantity") {
            const counts = countsFor(group);
            const unit = group.unit_label?.trim() || "items";

            for (const value of group.values) {
                const quantity = counts.get(value.id) ?? 0;
                if (!Number.isInteger(quantity) || quantity < 0) {
                    return fail("INVALID_OPTIONS", `Invalid quantity for ${value.name.toLowerCase()}`, group.id);
                }
                if (quantity > 0 && !value.is_available) {
                    return fail(
                        "OPTION_UNAVAILABLE",
                        `"${value.name}" is sold out. Please choose a different ${group.name.toLowerCase()}.`,
                        group.id
                    );
                }
                if (quantity === 0) {
                    continue;
                }
                snapshot.push({
                    option_id: group.id,
                    option_name: group.name,
                    value_id: value.id,
                    value_name: value.name,
                    price_delta: value.price_delta,
                    quantity,
                });
                // Per-unit delta, so a count scales the price rather than paying it once.
                totalCents += toCents(value.price_delta) * quantity;
            }

            // A dangling or self-referential link is an authoring mistake, not a
            // customer error, so it is caught here rather than trusted.
            if (group.linked_group_id === null || group.linked_total === null) {
                return fail("INVALID_OPTIONS", `"${group.name}" is not set up correctly.`, group.id);
            }
            continue;
        }

        const selected = group.values
            .filter((value) => chosen.has(value.id))
            .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
        const count = selected.length;
        const label = group.name.toLowerCase();

        if (count === 0 && (group.is_required || group.min_selections > 0)) {
            const message =
                group.min_selections > 1
                    ? `Choose at least ${countLabel(group.min_selections, label)}`
                    : `Please choose a ${label}`;
            return fail("INVALID_OPTIONS", message, group.id);
        }

        if (group.type === "radio" && count > 1) {
            return fail("INVALID_OPTIONS", `Choose only one ${label}`, group.id);
        }

        if (count < group.min_selections) {
            return fail("INVALID_OPTIONS", `Choose at least ${countLabel(group.min_selections, label)}`, group.id);
        }

        // Radio is pinned to exactly one pick regardless of what was sent.
        const effectiveMax = group.type === "radio" ? 1 : group.max_selections;
        if (effectiveMax !== null && count > effectiveMax) {
            return fail("INVALID_OPTIONS", `Choose up to ${countLabel(effectiveMax, label)}`, group.id);
        }

        for (const value of selected) {
            snapshot.push({
                option_id: group.id,
                option_name: group.name,
                value_id: value.id,
                value_name: value.name,
                price_delta: value.price_delta,
                quantity: 1,
            });
            totalCents += toCents(value.price_delta);
        }
    }

    // A linked pair only becomes checkable once both groups are resolved, so this
    // runs after the loop. Each pair is validated once, from its lower id, and the
    // partner must be a counted group on THIS product.
    const validatedPairs = new Set<string>();
    for (const group of quantityGroups) {
        if (group.linked_group_id === null || group.linked_total === null) {
            continue;
        }
        const partner = tree.find((candidate) => candidate.id === group.linked_group_id);
        // Structural check FIRST. Availability is the admin's business and may
        // change under the customer, but "linked to a missing or non-counted group"
        // can never be fixed from the storefront — so it must not be waved through
        // just because the partner happens to be switched off right now.
        if (!partner || partner.type !== "quantity") {
            return fail("INVALID_OPTIONS", `"${group.name}" is not set up correctly.`, group.id);
        }
        // Half a switched-off pair is not a customer error either: skip the whole
        // pair so the surviving half stays orderable.
        if (!group.is_available || !partner.is_available) {
            continue;
        }
        const pairKey = [group.id, group.linked_group_id].sort((a, b) => a - b).join("-");
        if (validatedPairs.has(pairKey)) {
            continue;
        }
        validatedPairs.add(pairKey);

        const combined = [...countsFor(group).values(), ...countsFor(partner).values()].reduce((a, b) => a + b, 0);
        if (combined !== group.linked_total) {
            // The unit is used verbatim rather than run through countLabel(): an
            // admin writes it in the form they want ("pieces"), and blindly
            // pluralizing it would produce "12 pieceses".
            const unit = group.unit_label?.trim();
            return fail(
                "INVALID_OPTIONS",
                unit ? `Choose exactly ${group.linked_total} ${unit} in total` : `Choose exactly ${group.linked_total} items in total`,
                group.id
            );
        }
    }

    const valueIds = snapshot.map((entry) => entry.value_id).sort((a, b) => a - b);
    const quantities = snapshot
        .filter((entry) => entry.quantity !== 1)
        .map((entry) => ({ valueId: entry.value_id, quantity: entry.quantity }))
        .sort((a, b) => a.valueId - b.valueId);
    return {
        ok: true,
        productId,
        productName: product.name,
        valueIds,
        quantities,
        signature: buildOptionsSignature(valueIds, quantities),
        snapshot,
        summary: buildSelectionSummary(snapshot),
        unitPrice: fromCents(totalCents),
        basePrice: fromCents(toCents(product.price)),
        optionsTotal: fromCents(totalCents - toCents(product.price)),
    };
};

// ------------------------------------------------------------------ tree input

export type OptionTreeResult =
    | { ok: true; options: OptionGroup[] }
    | { ok: false; code: "NOT_FOUND" | "INVALID"; message: string };

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value);
const optionalBoolean = (value: unknown, fallback: boolean): boolean => (value === undefined ? fallback : isBoolean(value) ? value : fallback);

interface NormalizedValue {
    id: number | null;
    name: string;
    description: string | null;
    price_delta: number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
    modifier_product_id: number | null;
}

interface NormalizedGroup {
    id: number | null;
    name: string;
    type: OptionType;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    is_available: boolean;
    /** Existing partner id, when the client round-tripped a saved pair. */
    linked_group_id: number | null;
    /** Sibling position in this payload, used when a brand-new pair is created. */
    linked_to_index: number | null;
    linked_total: number | null;
    unit_label: string | null;
    values: NormalizedValue[];
}

/**
 * Validates + normalizes an admin PUT payload. Returns the first problem as a
 * message the controller can show verbatim, so the builder can highlight the
 * offending group instead of failing opaquely.
 */
const normalizeTree = (
    input: unknown,
    modifierProductIDs: Set<number>
): { ok: true; groups: NormalizedGroup[] } | { ok: false; message: string } => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
        return { ok: false, message: "Request body must be an object" };
    }
    const rawOptions = (input as Record<string, unknown>).options;
    if (!Array.isArray(rawOptions)) {
        return { ok: false, message: "options must be an array" };
    }
    if (rawOptions.length > MAX_OPTION_GROUPS) {
        return { ok: false, message: `A product can have at most ${MAX_OPTION_GROUPS} option groups` };
    }

    const groups: NormalizedGroup[] = [];
    const seenOptionIDs = new Set<number>();

    for (const [index, rawGroup] of rawOptions.entries()) {
        const label = `Option group #${index + 1}`;
        if (typeof rawGroup !== "object" || rawGroup === null || Array.isArray(rawGroup)) {
            return { ok: false, message: `${label} must be an object` };
        }
        const group = rawGroup as Record<string, unknown>;

        const name = typeof group.name === "string" ? group.name.trim() : "";
        if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
            return { ok: false, message: `${label} needs a name of 1-${MAX_NAME_LENGTH} characters` };
        }
        if (group.type !== "radio" && group.type !== "checkbox" && group.type !== "quantity") {
            return { ok: false, message: `"${name}" must be of type radio, checkbox or quantity` };
        }
        const type = group.type as OptionType;

        const id = group.id === undefined || group.id === null ? null : Number(group.id);
        if (id !== null && (!isInteger(id) || id <= 0)) {
            return { ok: false, message: `"${name}" has an invalid id` };
        }
        if (id !== null) {
            if (seenOptionIDs.has(id)) {
                return { ok: false, message: `"${name}" is listed twice` };
            }
            seenOptionIDs.add(id);
        }

        const is_required = optionalBoolean(group.is_required, false);
        let min_selections = group.min_selections === undefined ? 0 : Number(group.min_selections);
        if (!isInteger(min_selections) || min_selections < 0) {
            return { ok: false, message: `"${name}" has an invalid min_selections` };
        }
        let max_selections =
            group.max_selections === undefined || group.max_selections === null ? null : Number(group.max_selections);
        if (max_selections !== null && (!isInteger(max_selections) || max_selections < 0)) {
            return { ok: false, message: `"${name}" has an invalid max_selections` };
        }
        if (type === "radio") {
            // A radio group is a single pick by definition, whatever was sent.
            max_selections = 1;
            min_selections = is_required ? 1 : 0;
        } else if (type === "quantity") {
            // A counted group has no pick bounds: the linked pair's total is the
            // only constraint, and the DB CHECK requires exactly this shape.
            min_selections = 0;
            max_selections = null;
        } else if (max_selections !== null && max_selections < min_selections) {
            return {
                ok: false,
                message: `"${name}" allows at most ${max_selections} but requires at least ${min_selections}`,
            };
        }

        // Counted groups carry the pair's fixed size. Both this and unit_label are
        // only meaningful for them, and the partner is resolved after every group
        // has an id (see replaceProductOptions), so it may arrive either as an
        // existing id or as a sibling index in this same payload.
        let linked_group_id: number | null = null;
        let linked_to_index: number | null = null;
        let linked_total: number | null = null;
        let unit_label: string | null = null;
        if (type === "quantity") {
            if (group.linked_total === undefined || group.linked_total === null) {
                return { ok: false, message: `"${name}" needs the total number of items to split` };
            }
            linked_total = Number(group.linked_total);
            if (!isInteger(linked_total) || linked_total < 0) {
                return { ok: false, message: `"${name}" has an invalid linked_total` };
            }
            if (linked_total > MAX_LINKED_TOTAL) {
                return { ok: false, message: `"${name}" splits more than ${MAX_LINKED_TOTAL} items` };
            }
            if (group.unit_label !== undefined && group.unit_label !== null) {
                unit_label = String(group.unit_label).trim();
                if (unit_label.length > MAX_NAME_LENGTH) {
                    return { ok: false, message: `"${name}" has a unit_label that is too long` };
                }
                if (unit_label.length === 0) {
                    unit_label = null;
                }
            }
            if (group.linked_group_id !== undefined && group.linked_group_id !== null) {
                linked_group_id = Number(group.linked_group_id);
                if (!isInteger(linked_group_id) || linked_group_id <= 0) {
                    return { ok: false, message: `"${name}" has an invalid linked_group_id` };
                }
            }
            if (group.linked_to_index !== undefined && group.linked_to_index !== null) {
                linked_to_index = Number(group.linked_to_index);
                if (!isInteger(linked_to_index) || linked_to_index < 0) {
                    return { ok: false, message: `"${name}" has an invalid linked_to_index` };
                }
            }
        } else if (group.linked_group_id !== undefined || group.linked_total !== undefined) {
            return { ok: false, message: `"${name}" cannot be linked because it is not a counted group` };
        }

        const sort_order = group.sort_order === undefined ? index : Number(group.sort_order);
        if (!isInteger(sort_order)) {
            return { ok: false, message: `"${name}" has an invalid sort_order` };
        }

        const rawValues = group.values;
        if (rawValues !== undefined && !Array.isArray(rawValues)) {
            return { ok: false, message: `"${name}" must have a values array` };
        }
        const rawValueList = (rawValues as unknown[]) ?? [];
        if (rawValueList.length > MAX_VALUES_PER_GROUP) {
            return { ok: false, message: `"${name}" can have at most ${MAX_VALUES_PER_GROUP} values` };
        }
        if (is_required && rawValueList.length === 0) {
            return { ok: false, message: `"${name}" is required but has no values to choose from` };
        }
        // Bounds are checked against the value list, not in isolation: a group
        // asking for more picks than it has values can never be satisfied, which
        // would leave the product listed but permanently unbuyable.
        if (type !== "quantity" && rawValueList.length > 0) {
            if (min_selections > rawValueList.length) {
                return {
                    ok: false,
                    message: `"${name}" requires at least ${min_selections} picks but only has ${rawValueList.length} values`,
                };
            }
            if (max_selections !== null && max_selections > rawValueList.length) {
                max_selections = rawValueList.length;
            }
        }

        const values: NormalizedValue[] = [];
        const seenValueIDs = new Set<number>();
        let defaultCount = 0;

        for (const [valueIndex, rawValue] of rawValueList.entries()) {
            if (typeof rawValue !== "object" || rawValue === null || Array.isArray(rawValue)) {
                return { ok: false, message: `"${name}" value #${valueIndex + 1} must be an object` };
            }
            const value = rawValue as Record<string, unknown>;

            const valueName = typeof value.name === "string" ? value.name.trim() : "";
            if (valueName.length === 0 || valueName.length > MAX_NAME_LENGTH) {
                return {
                    ok: false,
                    message: `"${name}" value #${valueIndex + 1} needs a name of 1-${MAX_NAME_LENGTH} characters`,
                };
            }

            const valueID = value.id === undefined || value.id === null ? null : Number(value.id);
            if (valueID !== null && (!isInteger(valueID) || valueID <= 0)) {
                return { ok: false, message: `"${valueName}" has an invalid id` };
            }
            if (valueID !== null) {
                if (seenValueIDs.has(valueID)) {
                    return { ok: false, message: `"${valueName}" is listed twice in "${name}"` };
                }
                seenValueIDs.add(valueID);
            }

            let description: string | null = null;
            if (value.description !== undefined && value.description !== null) {
                if (typeof value.description !== "string") {
                    return { ok: false, message: `"${valueName}" has an invalid description` };
                }
                const trimmed = value.description.trim();
                if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
                    return { ok: false, message: `"${valueName}" description exceeds ${MAX_DESCRIPTION_LENGTH} characters` };
                }
                description = trimmed.length === 0 ? null : trimmed;
            }

            const price_delta = value.price_delta === undefined ? 0 : Number(value.price_delta);
            if (typeof price_delta !== "number" || !Number.isFinite(price_delta) || price_delta < 0) {
                return { ok: false, message: `"${valueName}" needs a price_delta of 0 or more` };
            }
            if (price_delta > MAX_PRICE_DELTA) {
                return { ok: false, message: `"${valueName}" has a price_delta above the ${MAX_PRICE_DELTA} limit` };
            }

            const is_default = optionalBoolean(value.is_default, false);
            if (is_default) {
                defaultCount += 1;
            }
            if (type === "radio" && defaultCount > 1) {
                return { ok: false, message: `"${name}" is a single choice group, it can only have one default` };
            }

            const valueSort = value.sort_order === undefined ? valueIndex : Number(value.sort_order);
            if (!isInteger(valueSort)) {
                return { ok: false, message: `"${valueName}" has an invalid sort_order` };
            }

            let modifierProductID: number | null = null;
            if (value.modifier_product_id !== undefined && value.modifier_product_id !== null) {
                modifierProductID = Number(value.modifier_product_id);
                if (!isInteger(modifierProductID) || modifierProductID <= 0) {
                    return { ok: false, message: `"${valueName}" has an invalid modifier product` };
                }
                if (!modifierProductIDs.has(modifierProductID)) {
                    return { ok: false, message: `"${valueName}" must reference a modifier product` };
                }
            }

            values.push({
                id: valueID,
                name: valueName,
                description,
                price_delta: fromCents(toCents(price_delta)),
                is_default,
                is_available: optionalBoolean(value.is_available, true),
                sort_order: valueSort,
                modifier_product_id: modifierProductID,
            });
        }

        groups.push({
            id,
            name,
            type,
            is_required,
            min_selections,
            max_selections,
            sort_order,
            is_available: optionalBoolean(group.is_available, true),
            linked_group_id,
            linked_to_index,
            linked_total,
            unit_label,
            values,
        });
    }

    // A counted group is meaningless on its own, and the link has to point at
    // another counted group in THIS payload that declares the same total. Checked
    // here so a bad pair is rejected before anything is written.
    const groupCount = groups.length;
    for (const [index, group] of groups.entries()) {
        if (group.type !== "quantity") {
            continue;
        }
        const partner =
            group.linked_to_index !== null
                ? groups[group.linked_to_index]
                : group.linked_group_id !== null
                  ? groups.find((candidate) => candidate.id === group.linked_group_id)
                  : undefined;
        if (!partner) {
            return { ok: false, message: `"${group.name}" must be linked to a matching counted group` };
        }
        if (group.linked_to_index !== null && group.linked_to_index === index) {
            return { ok: false, message: `"${group.name}" cannot be linked to itself` };
        }
        // Round-tripping a saved group echoes its own id back, so the id form needs
        // the same guard as the index form. Without it the row violates the
        // `linked_group_id <> id` CHECK and surfaces as a raw 500.
        if (group.linked_group_id !== null && group.linked_group_id === group.id) {
            return { ok: false, message: `"${group.name}" cannot be linked to itself` };
        }
        if (group.linked_to_index !== null && group.linked_to_index >= groupCount) {
            return { ok: false, message: `"${group.name}" is linked to a group that does not exist` };
        }
        if (partner.type !== "quantity") {
            return { ok: false, message: `"${group.name}" must be linked to a counted group` };
        }
        if (partner.linked_total !== group.linked_total) {
            return {
                ok: false,
                message: `"${group.name}" and "${partner.name}" must split the same total`,
            };
        }
    }

    return { ok: true, groups };
};

// ------------------------------------------------------------------ service

export const ProductOptionsService = () => {
    const repository = ProductOptionsRepository();

    /** Batched product + option-tree fetch for selection validation. */
    const loadSelectionContext = async (db: Db, productIDs: number[]) => {
        const [products, trees] = await Promise.all([
            repository.getSelectableProducts(db, productIDs),
            repository.getOptionTreeByProductIDs(db, productIDs, true),
        ]);
        return { products, trees };
    };

    const getProductOptions = async (
        productID: number,
        includeUnavailable: boolean
    ): Promise<OptionGroup[] | null> => {
        const product = await repository.getSelectableProduct(pool, productID);
        if (product === null) {
            return null;
        }
        // The storefront must never be able to reach a sold-out or hidden modifier
        // product's tree. The admin builder opts back in via includeUnavailable=true.
        if (includeUnavailable === false && (product.is_available === false || product.is_modifier === true)) {
            return null;
        }
        return repository.getProductOptionTree(pool, productID, includeUnavailable);
    };

    const getModifierProducts = async (): Promise<ModifierProduct[]> => {
        return repository.listModifierProducts(pool);
    };

    /**
     * Full replace of a product's option tree in ONE transaction: groups and
     * values not present in the payload are removed (values cascade), existing
     * ids are updated in place so carts/order history keep referencing the same
     * rows. Returns the persisted tree, not the input.
     */
    const replaceProductOptions = async (productID: number, input: unknown): Promise<OptionTreeResult> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const product = await repository.getSelectableProduct(client, productID);
            if (product === null) {
                throw new ProductOptionsError("NOT_FOUND", "Product not found");
            }

            const referencedModifierIDs = collectModifierProductIDs(input);
            const modifierProductIDs = await repository.getModifierProductIDs(client, referencedModifierIDs);
            const normalized = normalizeTree(input, modifierProductIDs);
            if (!normalized.ok) {
                throw new ProductOptionsError("INVALID", normalized.message);
            }

            const existingOptionIDs = await repository.getOptionIDsForProduct(client, productID);
            const existingSet = new Set(existingOptionIDs);
            for (const group of normalized.groups) {
                if (group.id !== null && !existingSet.has(group.id)) {
                    throw new ProductOptionsError("INVALID", `"${group.name}" does not belong to this product`);
                }
            }

            const keptOptionIDs: number[] = [];
            for (const group of normalized.groups) {
                if (group.id === null) {
                    keptOptionIDs.push(
                        await repository.insertOption(client, productID, {
                            name: group.name,
                            type: group.type,
                            is_required: group.is_required,
                            min_selections: group.min_selections,
                            max_selections: group.max_selections,
                            sort_order: group.sort_order,
                            is_available: group.is_available,
                            // Resolved in the second pass below, once every group
                            // in the pair has a real id to point at.
                            linked_group_id: group.linked_group_id,
                            linked_total: group.linked_total,
                            unit_label: group.unit_label,
                        })
                    );
                } else {
                    await repository.updateOption(client, group.id, {
                        name: group.name,
                        type: group.type,
                        is_required: group.is_required,
                        min_selections: group.min_selections,
                        max_selections: group.max_selections,
                        sort_order: group.sort_order,
                        is_available: group.is_available,
                        linked_group_id: group.linked_group_id,
                        linked_total: group.linked_total,
                        unit_label: group.unit_label,
                    });
                    keptOptionIDs.push(group.id);
                }
            }
            await repository.deleteOptionsNotIn(client, productID, keptOptionIDs);

            // Second pass: point each counted group at its partner now that all
            // ids exist. A new pair references a sibling index, a saved pair
            // references a real id; both resolve to the same thing here.
            for (const [index, group] of normalized.groups.entries()) {
                if (group.type !== "quantity") {
                    continue;
                }
                const partnerID =
                    group.linked_to_index !== null
                        ? keptOptionIDs[group.linked_to_index]
                        : group.linked_group_id;
                if (partnerID === undefined || partnerID === null) {
                    throw new ProductOptionsError("INVALID", `"${group.name}" is not linked to a matching group`);
                }
                if (partnerID !== keptOptionIDs[index]) {
                    await repository.setOptionLink(client, keptOptionIDs[index], partnerID);
                }
            }

            for (const [index, group] of normalized.groups.entries()) {
                const optionID = keptOptionIDs[index];
                const existingValueIDs = new Set(await repository.getValueIDsForOption(client, optionID));
                for (const value of group.values) {
                    if (value.id !== null && !existingValueIDs.has(value.id)) {
                        throw new ProductOptionsError(
                            "INVALID",
                            `"${value.name}" does not belong to the "${group.name}" group`
                        );
                    }
                }

                const keptValueIDs: number[] = [];
                for (const value of group.values) {
                    if (value.id === null) {
                        keptValueIDs.push(
                            await repository.insertValue(client, optionID, {
                                name: value.name,
                                description: value.description,
                                price_delta: value.price_delta,
                                is_default: value.is_default,
                                is_available: value.is_available,
                                sort_order: value.sort_order,
                                modifier_product_id: value.modifier_product_id,
                            })
                        );
                    } else {
                        await repository.updateValue(client, value.id, {
                            name: value.name,
                            description: value.description,
                            price_delta: value.price_delta,
                            is_default: value.is_default,
                            is_available: value.is_available,
                            sort_order: value.sort_order,
                            modifier_product_id: value.modifier_product_id,
                        });
                        keptValueIDs.push(value.id);
                    }
                }
                await repository.deleteValuesNotIn(client, optionID, keptValueIDs);
            }

            await repository.setProductCustomizable(client, productID, keptOptionIDs.length > 0);

            const options = await repository.getProductOptionTree(client, productID, true);

            await client.query("COMMIT");
            return { ok: true, options };
        } catch (error) {
            await client.query("ROLLBACK");
            if (error instanceof ProductOptionsError) {
                return { ok: false, code: error.type, message: error.message };
            }
            throw error;
        } finally {
            client.release();
        }
    };

    const deleteProductOption = async (
        productID: number,
        optionID: number
    ): Promise<{ ok: true } | { ok: false; code: "NOT_FOUND" | "INVALID"; message: string }> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // linked_group_id is ON DELETE CASCADE, so removing one half of a
            // counted pair would destroy the other half too. Refuse instead, and
            // tell the admin to remove the pair together.
            const partner = await repository.getLinkedPartner(client, productID, optionID);
            if (partner !== null) {
                await client.query("ROLLBACK");
                return {
                    ok: false,
                    code: "INVALID",
                    message: `"${partner.name}" is part of a counted pair. Remove both halves together instead of deleting one.`,
                };
            }
            const deleted = await repository.deleteOption(client, productID, optionID);
            if (deleted === null) {
                await client.query("ROLLBACK");
                return { ok: false, code: "NOT_FOUND", message: "Option group not found" };
            }
            const remaining = await repository.getOptionIDsForProduct(client, productID);
            await repository.setProductCustomizable(client, productID, remaining.length > 0);
            await client.query("COMMIT");
            return { ok: true };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    /** Quick "sold out" / price tweak on a single value without rewriting the tree. */
    const patchProductOptionValue = async (valueID: number, input: unknown): Promise<OptionValue | { error: string }> => {
        if (typeof input !== "object" || input === null || Array.isArray(input)) {
            return { error: "Request body must be an object" };
        }
        const body = input as Record<string, unknown>;

        const current = await repository.getOptionValue(pool, valueID);
        if (current === null) {
            return { error: "Option value not found" };
        }

        let is_available = current.is_available;
        if (body.is_available !== undefined) {
            if (!isBoolean(body.is_available)) return { error: "is_available must be a boolean" };
            is_available = body.is_available;
        }
        let price_delta = current.price_delta;
        if (body.price_delta !== undefined) {
            const value = Number(body.price_delta);
            if (!Number.isFinite(value) || value < 0) return { error: "price_delta must be 0 or more" };
            if (value > MAX_PRICE_DELTA) return { error: `price_delta must be at most ${MAX_PRICE_DELTA}` };
            price_delta = fromCents(toCents(value));
        }
        let is_default = current.is_default;
        if (body.is_default !== undefined) {
            if (!isBoolean(body.is_default)) return { error: "is_default must be a boolean" };
            is_default = body.is_default;
        }
        if (body.is_available === undefined && body.price_delta === undefined && body.is_default === undefined) {
            return { error: "Nothing to update" };
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const updated = await repository.patchOptionValue(client, valueID, { is_available, price_delta, is_default });
            await client.query("COMMIT");
            return updated ?? { error: "Option value not found" };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    return {
        repository,
        loadSelectionContext,
        getProductOptions,
        getModifierProducts,
        replaceProductOptions,
        deleteProductOption,
        patchProductOptionValue,
    };
};

/** Best-effort pre-scan so modifier_product_id references can be verified. */
const collectModifierProductIDs = (input: unknown): number[] => {
    if (typeof input !== "object" || input === null) {
        return [];
    }
    const options = (input as Record<string, unknown>).options;
    if (!Array.isArray(options)) {
        return [];
    }
    const ids = new Set<number>();
    for (const group of options) {
        if (typeof group !== "object" || group === null) continue;
        const values = (group as Record<string, unknown>).values;
        if (!Array.isArray(values)) continue;
        for (const value of values) {
            if (typeof value !== "object" || value === null) continue;
            const modifier = (value as Record<string, unknown>).modifier_product_id;
            const parsed = Number(modifier);
            if (Number.isInteger(parsed) && parsed > 0) {
                ids.add(parsed);
            }
        }
    }
    return [...ids];
};
