import { memo } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { OptionGroup } from "../types";
import { effectiveMax, effectiveMin, sortedValues } from "../lib/selection";
import OptionValueCard from "./OptionValueCard";

interface OptionGroupSectionProps {
    group: OptionGroup;
    error?: string;
    showError: boolean;
    selectedCount: number;
    isSaturated: boolean;
    has: (valueID: number) => boolean;
    onPickRadio: (valueID: number) => void;
    onToggleCheck: (valueID: number, select: boolean) => void;
}

const GROUP_TYPE_LABEL: Record<OptionGroup["type"], string> = {
    radio: "Pick one",
    checkbox: "Pick many",
    // Counted groups are rendered by PieceMixSection, so this never reaches the UI.
    quantity: "Split",
};

/**
 * One option group: a tracked uppercase heading with the admin's rules
 * (required chip, running `n / max` counter) above a grid of option cards.
 */
const OptionGroupSection = ({
    group,
    error,
    showError,
    selectedCount,
    isSaturated,
    has,
    onPickRadio,
    onToggleCheck,
}: OptionGroupSectionProps) => {
    const values = sortedValues(group);
    const max = effectiveMax(group);
    const min = effectiveMin(group);
    const isCheckbox = group.type === "checkbox";
    // A group only *has* to be answered when its effective minimum is above 0,
    // which can come from is_required or from an explicit min_selections.
    const isMandatory = min > 0;
    const isSkippable = !isMandatory && !isCheckbox;
    const name = `option-group-${group.id}`;
    const describedBy = showError && error ? `${name}-error` : undefined;

    return (
        <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-2 flex w-full flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    {group.name}
                </span>
                {isMandatory ? (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                        {min > 1 ? `Pick ${min}+` : "Required"}
                    </span>
                ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {isSkippable ? "Optional" : GROUP_TYPE_LABEL[group.type]}
                    </span>
                )}
                {isCheckbox && (
                    <span
                        className={`ml-auto whitespace-nowrap text-xs font-bold tabular-nums ${
                            isSaturated ? "text-brand" : "text-muted-foreground"
                        }`}
                    >
                        {selectedCount} / {max} selected
                    </span>
                )}
            </legend>

            <div
                role={isCheckbox ? "group" : "radiogroup"}
                aria-label={group.name}
                aria-required={isMandatory || undefined}
                aria-describedby={describedBy}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
                {values.map((value) => (
                    <OptionValueCard
                        key={value.id}
                        value={value}
                        type={group.type}
                        name={name}
                        checked={has(value.id)}
                        blocked={isCheckbox && isSaturated}
                        onSelect={() =>
                            isCheckbox
                                ? onToggleCheck(value.id, !has(value.id))
                                : onPickRadio(value.id)
                        }
                    />
                ))}
            </div>

            {isSkippable && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                    Optional — tap the selected choice again to skip this group.
                </p>
            )}

            {describedBy && (
                <p
                    id={`${name}-error`}
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500"
                >
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                    {error}
                </p>
            )}
        </fieldset>
    );
};

export default memo(OptionGroupSection);
