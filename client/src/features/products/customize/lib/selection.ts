import type { OptionGroup, OptionQuantity, OptionValue, QuantityMap, SelectionMap } from "../types";

const bySortOrder = (a: OptionGroup, b: OptionGroup) => a.sort_order - b.sort_order;

/** Groups the customer may actually pick from, in the admin's intended order. */
export const activeGroups = (groups: OptionGroup[]): OptionGroup[] =>
    groups
        .filter((group) => group.is_available && group.values.some((value) => value.is_available))
        .slice()
        .sort(bySortOrder);

export const sortedValues = (group: OptionGroup): OptionValue[] =>
    group.values
        .filter((value) => value.is_available)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order);

export const isQuantityGroup = (group: OptionGroup): boolean => group.type === "quantity";

/**
 * A counted group and its partner, or null when it has no usable partner.
 *
 * Pairs are keyed by the two group ids so a group always resolves to the SAME
 * pair regardless of which half is being inspected.
 *
 * `null` covers two cases that callers must both tolerate: a group with no link at
 * all, and a group whose partner is missing from `groups` because the admin has
 * switched that half off. Neither is the customer's mistake, and neither may
 * block the add — the server skips a half-pair the same way.
 */
export const quantityPair = (
    groups: OptionGroup[],
    group: OptionGroup
): { group: OptionGroup; partner: OptionGroup } | null => {
    if (!isQuantityGroup(group) || group.linked_group_id === null) {
        return null;
    }
    const partner = groups.find((candidate) => candidate.id === group.linked_group_id);
    if (!partner || !isQuantityGroup(partner)) {
        return null;
    }
    return { group, partner };
};

/** Required implies at least one pick, even when `min_selections` is 0. */
export const effectiveMin = (group: OptionGroup): number =>
    Math.max(group.min_selections ?? 0, group.is_required ? 1 : 0);

/** A null `max_selections` means "as many as there are values". */
export const effectiveMax = (group: OptionGroup): number =>
    Math.min(group.max_selections ?? Number.MAX_SAFE_INTEGER, sortedValues(group).length);

const indefinite = /^[aeiou]/i;
const article = (name: string) => (indefinite.test(name.trim()) ? "an" : "a");

/** Pre-selects the admin's defaults; radio groups keep only their first default. */
export const initialSelection = (groups: OptionGroup[]): SelectionMap => {
    const selection: SelectionMap = {};
    for (const group of activeGroups(groups)) {
        // Counted groups live in QuantityMap, not here: their values are never
        // "picked", and a default of 1 would silently break the pair total.
        if (isQuantityGroup(group)) continue;
        const values = sortedValues(group).filter((value) => value.is_default);
        const chosen =
            group.type === "radio" ? values.slice(0, 1) : values.slice(0, effectiveMax(group));
        selection[group.id] = chosen.map((value) => value.id);
    }
    return selection;
};

export const selectedIDs = (selection: SelectionMap, groupID: number): number[] =>
    selection[groupID] ?? [];

export const isSelected = (selection: SelectionMap, groupID: number, valueID: number): boolean =>
    selectedIDs(selection, groupID).includes(valueID);

export const selectedCount = (selection: SelectionMap, group: OptionGroup): number =>
    selectedIDs(selection, group.id).length;

/** Total count currently assigned to one counted group, across all its values. */
export const quantityCount = (quantities: QuantityMap, group: OptionGroup): number =>
    group.values.reduce((sum, value) => sum + (quantities[value.id] ?? 0), 0);

/** How many pieces the whole pair must come to. */
export const pairTotal = (group: OptionGroup): number => group.linked_total ?? 0;

/**
 * Counted groups whose partner is claimed by more than one group.
 *
 * Such a tree cannot be drawn: the shared half would have to render inside two
 * different splits at once, and the modal can only show one of them. Anything
 * downstream that would otherwise seed, validate or render one of these is
 * skipped, so the customer sees no control whose state they cannot change instead
 * of a permanently blocked Add button. The admin builder cannot create this
 * shape, so it only ever arrives as legacy data.
 */
export const ambiguousCountedGroups = (groups: OptionGroup[]): Set<number> => {
    const claimants = new Map<number, number>();
    for (const group of groups) {
        const partner = quantityPair(groups, group)?.partner;
        if (partner) {
            claimants.set(partner.id, (claimants.get(partner.id) ?? 0) + 1);
        }
    }
    const ambiguous = new Set<number>();
    for (const group of groups) {
        const partner = quantityPair(groups, group)?.partner;
        // Either being double-claimed makes this group unrenderable.
        if ((claimants.get(group.id) ?? 0) > 1 || (partner && (claimants.get(partner.id) ?? 0) > 1)) {
            ambiguous.add(group.id);
        }
    }
    return ambiguous;
};

/**
 * Starting counts for a fresh modal.
 *
 * Every pair starts COMPLETE and valid: the whole total sits on the first
 * available value of the first half, the partner starts at zero. The customer
 * therefore never opens the modal to an invalid state, and only has to move
 * pieces between the two sides.
 */
export const initialQuantities = (groups: OptionGroup[]): QuantityMap => {
    const quantities: QuantityMap = {};
    const active = activeGroups(groups);
    const ambiguous = ambiguousCountedGroups(active);
    const seeded = new Set<number>();
    for (const group of active) {
        if (!isQuantityGroup(group) || seeded.has(group.id) || ambiguous.has(group.id)) {
            continue;
        }
        const pair = quantityPair(active, group);
        // Mark both halves so the partner is never seeded a second time.
        if (pair) {
            seeded.add(group.id);
            seeded.add(pair.partner.id);
        }
        const first = sortedValues(group)[0];
        if (first) {
            quantities[first.id] = pairTotal(group);
        }
    }
    return quantities;
};

/**
 * Moves `delta` pieces to/from one side of a pair, always taking from or giving
 * back to the other side so the pair total never changes.
 *
 * This is what makes "6 spicy" automatically become "6 original": the customer
 * only ever touches one counter and the other side absorbs the difference.
 */
export const stepQuantity = (
    groups: OptionGroup[],
    quantities: QuantityMap,
    group: OptionGroup,
    valueID: number,
    delta: number
): QuantityMap => {
    const pair = quantityPair(groups, group);
    const total = pairTotal(group);
    const current = quantityCount(quantities, group);
    const next = Math.min(Math.max(current + delta, 0), total);
    if (next === current) {
        return quantities;
    }
    const move = next - current;

    const next_ = { ...quantities };
    next_[valueID] = (next_[valueID] ?? 0) + move;

    // Push the difference onto the other side, starting with its first available
    // value, so the pair keeps summing to its fixed total.
    const other = pair ? pair.partner : null;
    if (other) {
        let remaining = -move;
        for (const value of sortedValues(other)) {
            if (remaining === 0) break;
            const available = other.linked_total === null ? remaining : Math.max(total - (next_[value.id] ?? 0), 0);
            const take = remaining > 0 ? Math.min(remaining, available) : Math.max(remaining, -(next_[value.id] ?? 0));
            if (take !== 0) {
                next_[value.id] = (next_[value.id] ?? 0) + take;
                remaining -= take;
            }
        }
    }
    return next_;
};

/** Non-zero counts as the `optionQuantities` payload for `POST /cart/items`. */
export const selectedQuantities = (groups: OptionGroup[], quantities: QuantityMap): OptionQuantity[] => {
    const entries: OptionQuantity[] = [];
    for (const group of groups) {
        if (!isQuantityGroup(group)) continue;
        for (const value of sortedValues(group)) {
            const quantity = quantities[value.id] ?? 0;
            if (quantity > 0) {
                entries.push({ valueId: value.id, quantity });
            }
        }
    }
    return entries;
};

/** True while another pick is still allowed (checkbox groups cap at `max_selections`). */
export const canSelectMore = (selection: SelectionMap, group: OptionGroup): boolean =>
    group.type === "radio" || selectedCount(selection, group) < effectiveMax(group);

/** Flattened value ids to send as `optionValueIDs` on `POST /cart/items`. */
export const selectedValueIDs = (groups: OptionGroup[], selection: SelectionMap): number[] => {
    const ids = new Set<number>();
    for (const group of groups) {
        // Counted values travel as optionQuantities, not as ids.
        if (isQuantityGroup(group)) continue;
        for (const id of selectedIDs(selection, group.id)) ids.add(id);
    }
    return [...ids];
};

/** Sum of every selected value's `price_delta`; the live "extras" amount. */
export const priceDeltaTotal = (
    groups: OptionGroup[],
    selection: SelectionMap,
    quantities: QuantityMap = {}
): number => {
    let total = 0;
    for (const group of groups) {
        if (isQuantityGroup(group)) {
            // A count is per unit, matching the server's price_delta * quantity.
            for (const value of group.values) {
                total += (Number(value.price_delta) || 0) * (quantities[value.id] ?? 0);
            }
            continue;
        }
        for (const id of selectedIDs(selection, group.id)) {
            const value = group.values.find((candidate) => candidate.id === id);
            if (value) total += Number(value.price_delta) || 0;
        }
    }
    return total;
};

export const totalPickCount = (groups: OptionGroup[], selection: SelectionMap): number =>
    groups.reduce((sum, group) => sum + selectedCount(selection, group), 0);

/**
 * Per-group validation messages, keyed by group id. Copy is deliberately specific
 * ("Choose a sauce", "Choose up to 5 toppings") so the customer knows exactly
 * what is missing without reading a generic banner.
 */
export const validateGroups = (
    groups: OptionGroup[],
    selection: SelectionMap,
    quantities: QuantityMap = {}
): Record<number, string> => {
    const errors: Record<number, string> = {};
    const reported = new Set<number>();
    const visible = activeGroups(groups);
    const ambiguous = ambiguousCountedGroups(visible);

    for (const group of visible) {
        if (isQuantityGroup(group)) {
            const pair = quantityPair(visible, group);
            if (!pair || ambiguous.has(group.id)) {
                // Unlinked, half-switched-off, or part of a tree the modal cannot
                // draw. The server skips these too, so holding the customer back
                // would only make the meal unbuyable.
                continue;
            }
            // Report a bad pair once, on whichever half the modal actually renders
            // first, so the customer does not see the same mistake printed twice.
            // Keyed by sort order rather than by lowest id, because that is the
            // half the message is read against.
            const reporterId = [group, pair.partner].sort(bySortOrder)[0].id;
            if (reported.has(reporterId)) {
                continue;
            }
            reported.add(reporterId);

            const combined =
                quantityCount(quantities, group) + quantityCount(quantities, pair.partner);
            if (combined !== pairTotal(group)) {
                const unit = group.unit_label?.trim() || "items";
                errors[reporterId] = `Choose exactly ${pairTotal(group)} ${unit} in total`;
            }
            continue;
        }

        const count = selectedCount(selection, group);
        const label = group.name.trim().toLowerCase();
        const min = effectiveMin(group);
        const max = effectiveMax(group);

        if (group.type === "radio") {
            // Mirrors the server: a radio group is capped at one pick, and is only
            // mandatory when min_selections (or is_required) demands one.
            if (count > 1) {
                errors[group.id] = `Choose only one ${label}`;
            } else if (count < min) {
                errors[group.id] = `Choose ${article(group.name)} ${label}`;
            }
            continue;
        }

        if (count > max) {
            errors[group.id] = `Choose up to ${max} ${label}`;
        } else if (count < min) {
            errors[group.id] = `Choose at least ${min} ${label}`;
        }
    }
    return errors;
};

export const isSelectionValid = (
    groups: OptionGroup[],
    selection: SelectionMap,
    quantities: QuantityMap = {}
): boolean => Object.keys(validateGroups(groups, selection, quantities)).length === 0;
