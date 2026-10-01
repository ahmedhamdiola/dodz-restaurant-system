import type { ModifierProduct, OptionGroup, OptionGroupType, OptionValue } from "../../../products/customize/types";
import type { OptionGroupPayload, OptionValuePayload } from "../../services/optionsApi";

/**
 * Local, string-friendly draft of the option tree. Numbers stay as strings while
 * editing so a half-typed price never gets coerced to `NaN` in the inputs, and
 * `key` gives every row a stable React identity before the server assigns ids.
 */
export interface OptionValueDraft {
    key: string;
    id?: number;
    name: string;
    description: string;
    price_delta: string;
    is_default: boolean;
    is_available: boolean;
    modifier_product_id: number | null;
    modifier: ModifierProduct | null;
}

export interface OptionGroupDraft {
    key: string;
    id?: number;
    name: string;
    type: OptionGroupType;
    is_required: boolean;
    min_selections: string;
    /** Empty string means "no cap" and is sent as `max_selections: null`. */
    max_selections: string;
    is_available: boolean;
    /**
     * "quantity" groups only. The pair is stored as a partner id, which is what
     * the API speaks, plus the fixed total and unit label the customer sees.
     */
    linked_group_id: number | null;
    linked_total: string;
    unit_label: string;
    values: OptionValueDraft[];
}

let sequence = 0;
const nextKey = (prefix: string) => `${prefix}-${++sequence}`;

export const toValueDraft = (value: OptionValue): OptionValueDraft => ({
    key: nextKey("value"),
    id: value.id,
    name: value.name,
    description: value.description ?? "",
    price_delta: String(value.price_delta ?? 0),
    is_default: value.is_default,
    is_available: value.is_available,
    modifier_product_id: value.modifier_product_id,
    modifier: value.modifier
        ? {
              id: value.modifier.id,
              name: value.modifier.name,
              image: value.modifier.image,
              price: value.modifier.price,
              category_name: "",
              is_available: true,
          }
        : null,
});

export const toGroupDraft = (group: OptionGroup): OptionGroupDraft => ({
    key: nextKey("group"),
    id: group.id,
    name: group.name,
    type: group.type,
    is_required: group.is_required,
    min_selections: String(group.min_selections ?? 0),
    max_selections: group.max_selections === null ? "" : String(group.max_selections),
    is_available: group.is_available,
    linked_group_id: group.linked_group_id ?? null,
    linked_total: group.linked_total === null ? "" : String(group.linked_total),
    unit_label: group.unit_label ?? "",
    values: group.values
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(toValueDraft),
});

export const createValueDraft = (name = ""): OptionValueDraft => ({
    key: nextKey("value"),
    name,
    description: "",
    price_delta: "0",
    is_default: false,
    is_available: true,
    modifier_product_id: null,
    modifier: null,
});

export const createGroupDraft = (name = ""): OptionGroupDraft => ({
    key: nextKey("group"),
    name,
    type: "radio",
    is_required: true,
    min_selections: "1",
    max_selections: "",
    is_available: true,
    linked_group_id: null,
    linked_total: "",
    unit_label: "",
    values: [createValueDraft()],
});

const toNumber = (raw: string): number => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Positions of the partner for every counted group that has no saved id yet.
 *
 * A brand-new pair has no database id on either half, so partners are exchanged as
 * sibling indices and the server resolves them once both rows exist. The pair is
 * matched on the shared total, which is the one thing both halves must agree on.
 *
 * Claimed indices are consumed as they are assigned, so a third counted group
 * cannot attach itself to a half that is already spoken for. Without that, three
 * groups sharing a total all resolve to the FIRST candidate, which the server
 * accepts (every pair's totals do agree) but which the storefront reads as one
 * group holding the full total plus two more that can never be zeroed.
 */
const linkedPartnerIndices = (groups: OptionGroupDraft[]): Map<string, number> => {
    const partners = new Map<string, number>();
    const claimed = new Set<number>();

    const reservePartner = (group: OptionGroupDraft) => {
        const total = toNumber(group.linked_total);
        for (const [index, candidate] of groups.entries()) {
            if (
                claimed.has(index) ||
                candidate.key === group.key ||
                candidate.type !== "quantity" ||
                candidate.linked_group_id !== null ||
                toNumber(candidate.linked_total) !== total
            ) {
                continue;
            }
            claimed.add(index);
            partners.set(group.key, index);
            // Consume the partner too: a pair is two halves, so this one cannot
            // also be the partner of a later group.
            partners.set(candidate.key, groups.indexOf(group));
            return;
        }
    };

    for (const group of groups) {
        if (group.type === "quantity" && group.linked_group_id === null) {
            reservePartner(group);
        }
    }
    return partners;
};

export const serializeGroups = (groups: OptionGroupDraft[]): OptionGroupPayload[] => {
    const partnerIndices = linkedPartnerIndices(groups);

    return groups.map((group, groupIndex) => {
        // A radio group is structurally exactly-one, so its bounds are derived
        // from `is_required` rather than typed by the admin. A counted group has
        // no pick bounds at all; the pair's fixed total is the only constraint.
        const isRadio = group.type === "radio";
        const isQuantity = group.type === "quantity";
        const min = isRadio
            ? group.is_required
                ? 1
                : 0
            : isQuantity
              ? 0
              : Math.max(0, toNumber(group.min_selections));
        const max = isRadio ? 1 : isQuantity ? null : group.max_selections.trim() === "" ? null : Math.max(0, toNumber(group.max_selections));

        return {
            ...(group.id ? { id: group.id } : {}),
            name: group.name.trim(),
            type: group.type,
            is_required: group.is_required,
            min_selections: min,
            max_selections: max,
            sort_order: groupIndex,
            is_available: group.is_available,
            // Counted groups carry the pair's size and unit; the partner is resolved
            // server-side from either this id or the sibling index below.
            ...(isQuantity
                ? {
                      linked_total: Math.max(0, toNumber(group.linked_total)),
                      ...(group.unit_label.trim() ? { unit_label: group.unit_label.trim() } : {}),
                      ...(group.linked_group_id
                          ? { linked_group_id: group.linked_group_id }
                          : { linked_to_index: partnerIndices.get(group.key) ?? undefined }),
                  }
                : {}),
            values: group.values.map((value, valueIndex) => {
                const payload: OptionValuePayload = {
                    ...(value.id ? { id: value.id } : {}),
                    name: value.name.trim(),
                    price_delta: toNumber(value.price_delta),
                    is_default: value.is_default,
                    is_available: value.is_available,
                    sort_order: valueIndex,
                };
                const description = value.description.trim();
                if (description) payload.description = description;
                if (value.modifier_product_id) {
                    payload.modifier_product_id = value.modifier_product_id;
                }
                return payload;
            }),
        };
    });
};

/** Mirrors the server's hard caps so the admin never round-trips a rejected PUT. */
export const OPTION_LIMITS = {
    maxGroups: 12,
    maxValuesPerGroup: 60,
    maxNameLength: 150,
    maxDescriptionLength: 500,
} as const;

/** Readable, human-first validation summary shown before the PUT is attempted. */
export const validateGroups = (groups: OptionGroupDraft[]): string[] => {
    const issues: string[] = [];
    const partnerIndices = linkedPartnerIndices(groups);

    if (groups.length > OPTION_LIMITS.maxGroups) {
        issues.push(
            `A product can have at most ${OPTION_LIMITS.maxGroups} option groups (you have ${groups.length}).`
        );
    }

    groups.forEach((group, index) => {
        const label = group.name.trim() || `Group ${index + 1}`;
        if (!group.name.trim()) {
            issues.push(`Group ${index + 1} needs a name.`);
        } else if (group.name.trim().length > OPTION_LIMITS.maxNameLength) {
            issues.push(
                `“${label}” name is longer than ${OPTION_LIMITS.maxNameLength} characters.`
            );
        }
        if (group.values.length === 0) {
            issues.push(`“${label}” needs at least one choice.`);
        } else if (group.values.length > OPTION_LIMITS.maxValuesPerGroup) {
            issues.push(
                `“${label}” can have at most ${OPTION_LIMITS.maxValuesPerGroup} choices (it has ${group.values.length}).`
            );
        }

        const min = Math.max(0, toNumber(group.min_selections));
        const hasMax = group.max_selections.trim() !== "";
        const max = hasMax ? Math.max(0, toNumber(group.max_selections)) : null;
        const valueCount = group.values.length;

        if (group.type === "checkbox") {
            if (max !== null && max > 0 && valueCount > 0 && max > valueCount) {
                issues.push(`“${label}” allows ${max} selections but only has ${valueCount} choices.`);
            }
            if (max !== null && min > max) {
                issues.push(`“${label}” min (${min}) cannot be greater than max (${max}).`);
            }
            if (group.is_required && min === 0) {
                issues.push(`“${label}” is required, so min selections must be at least 1.`);
            }
        }

        if (group.type === "quantity") {
            // A counted group with no total cannot be validated against anything,
            // so catch it here rather than letting the PUT come back rejected.
            if (group.linked_total.trim() === "" || toNumber(group.linked_total) < 0) {
                issues.push(`“${label}” needs the total number of ${group.unit_label.trim() || "items"} to split.`);
            }
            // The pair splits one fixed total, so an unpaired half is unroutable:
            // the customer can never reach the total and the server rejects the PUT.
            const hasPartner = group.linked_group_id !== null || partnerIndices.has(group.key);
            if (!hasPartner) {
                issues.push(
                    `“${label}” needs a second counted group to split its total with.`
                );
            }
        }

        const defaults = group.values.filter((value) => value.is_default);
        if (defaults.length > 1 && group.type === "radio") {
            issues.push(`“${label}” can only have one default choice.`);
        }
        const allowedDefaults = max === null ? group.values.length : max;
        if (defaults.length > allowedDefaults) {
            issues.push(
                `“${label}” has ${defaults.length} defaults but only ${allowedDefaults} can be picked.`
            );
        }

        group.values.forEach((value, valueIndex) => {
            if (!value.name.trim()) {
                issues.push(`“${label}” choice ${valueIndex + 1} needs a name.`);
            } else if (value.name.trim().length > OPTION_LIMITS.maxNameLength) {
                issues.push(
                    `“${value.name.trim()}” name is longer than ${OPTION_LIMITS.maxNameLength} characters.`
                );
            }
            if (value.price_delta.trim() !== "" && !Number.isFinite(Number(value.price_delta))) {
                issues.push(`“${value.name.trim() || label}” #${valueIndex + 1} price must be a number.`);
            }
            if (value.description.length > OPTION_LIMITS.maxDescriptionLength) {
                issues.push(
                    `“${value.name.trim() || label}” description is longer than ${OPTION_LIMITS.maxDescriptionLength} characters.`
                );
            }
        });
    });

    return issues;
};

/** Stable string form used for cheap dirty-checking against the loaded tree. */
export const snapshotGroups = (groups: OptionGroupDraft[]): string =>
    JSON.stringify(
        groups.map((group) => ({
            ...group,
            key: undefined,
            values: group.values.map((value) => ({ ...value, key: undefined })),
        }))
    );

/** Immutably move an item inside a list, clamped to the list bounds. */
export const moveItem = <T,>(list: T[], from: number, to: number): T[] => {
    if (from === to || from < 0 || from >= list.length) return list;
    const target = Math.min(Math.max(to, 0), list.length - 1);
    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    return next;
};

/**
 * Radio groups can only carry one default, so switching a value on clears the
 * rest; checkbox groups toggle independently.
 */
export const toggleDefault = (
    values: OptionValueDraft[],
    key: string,
    type: OptionGroupType,
    next: boolean
): OptionValueDraft[] =>
    type === "radio"
        ? values.map((value) => ({ ...value, is_default: next && value.key === key }))
        : values.map((value) => (value.key === key ? { ...value, is_default: next } : value));

/** When a group flips radio → checkbox keep the defaults; the reverse keeps one. */
export const coerceDefaults = (values: OptionValueDraft[], type: OptionGroupType) => {
    // Counted values have no "default": the pair's total decides the split, and a
    // default of 1 would be meaningless here.
    if (type === "checkbox") return values;
    const first = values.find((value) => value.is_default);
    return values.map((value) => ({ ...value, is_default: value.key === first?.key }));
};
