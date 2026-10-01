import { useState } from "react";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CubeIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { formatPrice } from "../../../../lib/format";
import type { ModifierProduct, OptionGroupType } from "../../../products/customize/types";
import ModifierPickerModal from "./ModifierPickerModal";
import {
    coerceDefaults,
    createGroupDraft,
    createValueDraft,
    moveItem,
    toggleDefault,
    OPTION_LIMITS,
    type OptionGroupDraft,
    type OptionValueDraft,
} from "./optionDraft";

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50";

const iconButton =
    "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-30";

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (next: boolean) => void;
    disabled?: boolean;
}

/** Mirrors the ProductModal `role="switch"` pattern. */
const Switch = ({ label, checked, onChange, disabled = false }: SwitchProps) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? "bg-brand" : "bg-muted"
        }`}
    >
        <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                checked ? "left-[22px]" : "left-0.5"
            }`}
        />
    </button>
);

interface SegmentedProps {
    value: OptionGroupType;
    onChange: (next: OptionGroupType) => void;
    name: string;
    disabled?: boolean;
}

const GROUP_TYPE_LABEL: Record<OptionGroupType, string> = {
    radio: "Pick one",
    checkbox: "Pick many",
    quantity: "Split",
};

const SegmentedControl = ({ value, onChange, name, disabled = false }: SegmentedProps) => (
    <div className="inline-flex rounded-lg border border-border bg-primary p-0.5">
        {(Object.keys(GROUP_TYPE_LABEL) as OptionGroupType[]).map((option) => (
            <label key={option} className="cursor-pointer">
                <input
                    type="radio"
                    name={name}
                    className="peer sr-only"
                    checked={value === option}
                    disabled={disabled}
                    onChange={() => onChange(option)}
                />
                <span
                    className={`block rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${
                        value === option
                            ? "bg-brand text-white"
                            : "text-muted-foreground hover:text-secondary"
                    }`}
                >
                    {GROUP_TYPE_LABEL[option]}
                </span>
            </label>
        ))}
    </div>
);

interface OptionGroupsBuilderProps {
    groups: OptionGroupDraft[];
    onChange: (next: OptionGroupDraft[]) => void;
    disabled?: boolean;
}

const ModifierChip = ({
    modifier,
    onClear,
}: {
    modifier: ModifierProduct;
    onClear: () => void;
}) => (
    <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-primary px-2 py-1.5">
        {modifier.image && (
            <img
                src={modifier.image}
                alt=""
                loading="lazy"
                className="h-7 w-7 shrink-0 rounded object-cover"
            />
        )}
        <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-secondary">
                {modifier.name}
            </span>
            <span className="block text-[10px] text-muted-foreground">
                {formatPrice(modifier.price)}
            </span>
        </span>
        <button
            type="button"
            onClick={onClear}
            aria-label={`Unlink ${modifier.name}`}
            className="shrink-0 cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-red-500"
        >
            <TrashIcon className="h-3.5 w-3.5" />
        </button>
    </span>
);

/**
 * Admin option-group builder. Groups and their values are pure local drafts; the
 * whole tree is persisted with one `PUT /products/:id/options` full-replace call
 * from the product modal's Save action, so ordering is simply array order.
 */
const OptionGroupsBuilder = ({ groups, onChange, disabled = false }: OptionGroupsBuilderProps) => {
    const [picker, setPicker] = useState<{ groupKey: string; valueKey: string } | null>(null);

    const patchGroup = (key: string, patch: Partial<OptionGroupDraft>) =>
        onChange(groups.map((group) => (group.key === key ? { ...group, ...patch } : group)));

    const patchValue = (
        groupKey: string,
        valueKey: string,
        patch: Partial<OptionValueDraft>
    ) =>
        onChange(
            groups.map((group) =>
                group.key === groupKey
                    ? {
                          ...group,
                          values: group.values.map((value) =>
                              value.key === valueKey ? { ...value, ...patch } : value
                          ),
                      }
                    : group
            )
        );

    const pickerTarget = picker
        ? groups
              .find((group) => group.key === picker.groupKey)
              ?.values.find((value) => value.key === picker.valueKey) ?? null
        : null;

    return (
        <section className="flex flex-col gap-3">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">
                        Option Groups
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                        {groups.length === 0
                            ? "No groups yet — customers add this item as it is."
                            : `${groups.length} of ${OPTION_LIMITS.maxGroups} groups used.`}
                    </p>
                </div>
                <button
                    type="button"
                    disabled={disabled || groups.length >= OPTION_LIMITS.maxGroups}
                    onClick={() => onChange([...groups, createGroupDraft()])}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-secondary transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add group
                </button>
            </header>

            {groups.map((group, groupIndex) => {
                const isCheckbox = group.type === "checkbox";
                const isQuantity = group.type === "quantity";
                return (
                    <article
                        key={group.key}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-primary/40 p-3"
                    >
                        <div className="flex items-center gap-2">
                            <input
                                value={group.name}
                                disabled={disabled}
                                maxLength={OPTION_LIMITS.maxNameLength}
                                onChange={(event) => patchGroup(group.key, { name: event.target.value })}
                                placeholder="Group name (e.g. Choose a sauce)"
                                aria-label={`Option group ${groupIndex + 1} name`}
                                className={`${inputClass} font-semibold`}
                            />
                            <button
                                type="button"
                                className={iconButton}
                                disabled={disabled || groupIndex === 0}
                                onClick={() =>
                                    onChange(moveItem(groups, groupIndex, groupIndex - 1))
                                }
                                aria-label={`Move ${group.name || `group ${groupIndex + 1}`} up`}
                            >
                                <ArrowUpIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                className={iconButton}
                                disabled={disabled || groupIndex === groups.length - 1}
                                onClick={() =>
                                    onChange(moveItem(groups, groupIndex, groupIndex + 1))
                                }
                                aria-label={`Move ${group.name || `group ${groupIndex + 1}`} down`}
                            >
                                <ArrowDownIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                className={`${iconButton} hover:border-red-500 hover:text-red-500`}
                                disabled={disabled}
                                onClick={() =>
                                    onChange(groups.filter((candidate) => candidate.key !== group.key))
                                }
                                aria-label={`Delete ${group.name || `group ${groupIndex + 1}`}`}
                            >
                                <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                            <SegmentedControl
                                name={`option-type-${group.key}`}
                                value={group.type}
                                disabled={disabled}
                                onChange={(next) =>
                                    patchGroup(group.key, {
                                        type: next,
                                        min_selections: next === "checkbox" ? "1" : "0",
                                        max_selections: "",
                                        // Only a counted group carries a pair, so the link
                                        // is cleared on every type change to stop a stale one
                                        // leaking into an unrelated group.
                                        linked_group_id: null,
                                        linked_total: "",
                                        unit_label: "",
                                        values: coerceDefaults(group.values, next),
                                    })
                                }
                            />
                            <label className="flex items-center gap-2">
                                <Switch
                                    label="Required"
                                    checked={group.is_required}
                                    disabled={disabled}
                                    onChange={(next) =>
                                        patchGroup(group.key, {
                                            is_required: next,
                                            min_selections: isCheckbox
                                                ? next
                                                    ? String(Math.max(1, Number(group.min_selections) || 0))
                                                    : "0"
                                                : group.min_selections,
                                        })
                                    }
                                />
                                <span className="text-xs font-semibold text-secondary">Required</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <Switch
                                    label={`${group.name || "Group"} availability`}
                                    checked={group.is_available}
                                    disabled={disabled}
                                    onChange={(next) => patchGroup(group.key, { is_available: next })}
                                />
                                <span className="text-xs font-semibold text-secondary">Available</span>
                            </label>

                            {isCheckbox ? (
                                <>
                                    <label className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Min
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={group.min_selections}
                                            disabled={disabled}
                                            onChange={(event) =>
                                                patchGroup(group.key, { min_selections: event.target.value })
                                            }
                                            aria-label={`${group.name} minimum selections`}
                                            className={`${inputClass} w-20 py-1.5`}
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Max
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={group.max_selections}
                                            disabled={disabled}
                                            onChange={(event) =>
                                                patchGroup(group.key, { max_selections: event.target.value })
                                            }
                                            placeholder="∞"
                                            aria-label={`${group.name} maximum selections, blank for no limit`}
                                            className={`${inputClass} w-20 py-1.5`}
                                        />
                                    </label>
                                </>
                            ) : isQuantity ? (
                                <>
                                    <label className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Total
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={group.linked_total}
                                            disabled={disabled}
                                            onChange={(event) =>
                                                patchGroup(group.key, { linked_total: event.target.value })
                                            }
                                            aria-label={`${group.name} total pieces to split`}
                                            className={`${inputClass} w-20 py-1.5`}
                                        />
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            Unit
                                        </span>
                                        <input
                                            type="text"
                                            value={group.unit_label}
                                            disabled={disabled}
                                            onChange={(event) =>
                                                patchGroup(group.key, { unit_label: event.target.value })
                                            }
                                            placeholder="pieces"
                                            aria-label={`${group.name} unit label`}
                                            className={`${inputClass} w-24 py-1.5`}
                                        />
                                    </label>
                                </>
                            ) : (
                                <span className="text-[11px] text-muted-foreground">
                                    Exactly one choice
                                    {group.is_required ? " is required." : " (optional)."}
                                </span>
                            )}
                        </div>

                        {isQuantity && (
                            <p className="rounded-md border border-dashed border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                                A counted group splits a fixed total between two sides, so it needs a
                                partner group sharing the same total. Add a second counted group with
                                the same total and they pair up automatically.
                            </p>
                        )}

                        {!group.is_available && (
                            <p className="rounded-md border border-dashed border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">
                                Hidden from customers until you switch it back on.
                            </p>
                        )}

                        <ul className="flex flex-col gap-2">
                            {group.values.map((value, valueIndex) => (
                                <li
                                    key={value.key}
                                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={value.name}
                                            disabled={disabled}
                                            maxLength={OPTION_LIMITS.maxNameLength}
                                            onChange={(event) =>
                                                patchValue(group.key, value.key, {
                                                    name: event.target.value,
                                                })
                                            }
                                            placeholder="Choice name (e.g. Hot & Spicy)"
                                            aria-label={`Choice ${valueIndex + 1} of ${group.name}`}
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            className={iconButton}
                                            disabled={disabled || valueIndex === 0}
                                            onClick={() =>
                                                patchGroup(group.key, {
                                                    values: moveItem(group.values, valueIndex, valueIndex - 1),
                                                })
                                            }
                                            aria-label={`Move ${value.name || `choice ${valueIndex + 1}`} up`}
                                        >
                                            <ArrowUpIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            className={iconButton}
                                            disabled={disabled || valueIndex === group.values.length - 1}
                                            onClick={() =>
                                                patchGroup(group.key, {
                                                    values: moveItem(group.values, valueIndex, valueIndex + 1),
                                                })
                                            }
                                            aria-label={`Move ${value.name || `choice ${valueIndex + 1}`} down`}
                                        >
                                            <ArrowDownIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${iconButton} hover:border-red-500 hover:text-red-500`}
                                            disabled={disabled}
                                            onClick={() =>
                                                patchGroup(group.key, {
                                                    values: group.values.filter(
                                                        (candidate) => candidate.key !== value.key
                                                    ),
                                                })
                                            }
                                            aria-label={`Delete ${value.name || `choice ${valueIndex + 1}`}`}
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        <input
                                            value={value.description}
                                            disabled={disabled}
                                            maxLength={OPTION_LIMITS.maxDescriptionLength}
                                            onChange={(event) =>
                                                patchValue(group.key, value.key, {
                                                    description: event.target.value,
                                                })
                                            }
                                            placeholder="Description (optional)"
                                            aria-label={`Description for ${value.name || `choice ${valueIndex + 1}`}`}
                                            className={`${inputClass} col-span-2`}
                                        />
                                        <label className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                +EGP
                                            </span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={value.price_delta}
                                                disabled={disabled}
                                                onChange={(event) =>
                                                    patchValue(group.key, value.key, {
                                                        price_delta: event.target.value,
                                                    })
                                                }
                                                aria-label={`Price delta for ${value.name || `choice ${valueIndex + 1}`}`}
                                                className={`${inputClass} py-1.5`}
                                            />
                                        </label>
                                        <div className="col-span-2 flex items-center gap-4 sm:col-span-1">
                                            <label className="flex items-center gap-1.5">
                                                <Switch
                                                    label={`Default for ${value.name || `choice ${valueIndex + 1}`}`}
                                                    checked={value.is_default}
                                                    disabled={disabled}
                                                    onChange={(next) =>
                                                        patchGroup(group.key, {
                                                            values: toggleDefault(
                                                                group.values,
                                                                value.key,
                                                                group.type,
                                                                next
                                                            ),
                                                        })
                                                    }
                                                />
                                                <span className="text-[11px] font-semibold text-secondary">
                                                    Default
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-1.5">
                                                <Switch
                                                    label={`Availability of ${value.name || `choice ${valueIndex + 1}`}`}
                                                    checked={value.is_available}
                                                    disabled={disabled}
                                                    onChange={(next) =>
                                                        patchValue(group.key, value.key, {
                                                            is_available: next,
                                                        })
                                                    }
                                                />
                                                <span className="text-[11px] font-semibold text-secondary">
                                                    On
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {value.modifier ? (
                                            <ModifierChip
                                                modifier={value.modifier}
                                                onClear={() =>
                                                    patchValue(group.key, value.key, {
                                                        modifier: null,
                                                        modifier_product_id: null,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() =>
                                                    setPicker({
                                                        groupKey: group.key,
                                                        valueKey: value.key,
                                                    })
                                                }
                                                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <CubeIcon className="h-3.5 w-3.5" />
                                                Link modifier product
                                            </button>
                                        )}
                                        {value.modifier && (
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() =>
                                                    setPicker({
                                                        groupKey: group.key,
                                                        valueKey: value.key,
                                                    })
                                                }
                                                className="shrink-0 cursor-pointer rounded-lg border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-secondary transition-colors hover:border-brand hover:text-brand"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            disabled={disabled || group.values.length >= OPTION_LIMITS.maxValuesPerGroup}
                            onClick={() =>
                                patchGroup(group.key, { values: [...group.values, createValueDraft()] })
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <PlusIcon className="h-3.5 w-3.5" />
                            {group.values.length >= OPTION_LIMITS.maxValuesPerGroup
                                ? `Max ${OPTION_LIMITS.maxValuesPerGroup} choices`
                                : "Add choice"}
                        </button>
                    </article>
                );
            })}

            <ModifierPickerModal
                open={picker !== null}
                current={pickerTarget?.modifier ?? null}
                onClose={() => setPicker(null)}
                onSelect={(modifier) => {
                    if (picker) {
                        patchValue(picker.groupKey, picker.valueKey, {
                            modifier,
                            modifier_product_id: modifier?.id ?? null,
                        });
                    }
                }}
            />
        </section>
    );
};

export default OptionGroupsBuilder;
