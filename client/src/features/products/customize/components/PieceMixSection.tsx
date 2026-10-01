import { memo } from "react";
import { ExclamationTriangleIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { OptionGroup } from "../types";
import { sortedValues } from "../lib/selection";

interface PieceMixSectionProps {
    /** The half being rendered; carries the shared total and unit. */
    group: OptionGroup;
    /**
     * The other half of the pair, or null when the admin has switched it off. The
     * split collapses to a single counter bounded by the same total, so the
     * customer can still reach the meal's size instead of losing the group.
     */
    partner: OptionGroup | null;
    error?: string;
    showError: boolean;
    quantityOf: (valueID: number) => number;
    countInGroup: (group: OptionGroup) => number;
    total: number;
    unit: string;
    onStep: (group: OptionGroup, valueID: number, delta: number) => void;
}

const stepperButton =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-secondary transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-30";

/** One side of the split: a label with a -/+ stepper around the current count. */
const Counter = ({
    label,
    count,
    group,
    valueID,
    canDecrement,
    canIncrement,
    onStep,
}: {
    label: string;
    count: number;
    group: OptionGroup;
    valueID: number;
    canDecrement: boolean;
    canIncrement: boolean;
    onStep: (group: OptionGroup, valueID: number, delta: number) => void;
}) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
        <span className="min-w-0 truncate text-sm font-semibold text-secondary">{label}</span>
        <div className="flex shrink-0 items-center gap-1">
            <button
                type="button"
                className={stepperButton}
                // Never below zero, even mid-pair: a side can legitimately be empty.
                disabled={!canDecrement}
                onClick={() => onStep(group, valueID, -1)}
                aria-label={`One fewer ${label}`}
            >
                <MinusIcon className="h-4 w-4" />
            </button>
            <span
                className="min-w-8 text-center text-base font-bold tabular-nums text-secondary"
                aria-live="polite"
            >
                {count}
            </span>
            <button
                type="button"
                className={stepperButton}
                disabled={!canIncrement}
                onClick={() => onStep(group, valueID, 1)}
                aria-label={`One more ${label}`}
            >
                <PlusIcon className="h-4 w-4" />
            </button>
        </div>
    </div>
);

/**
 * The "8 Original + 4 Spicy" picker for a fixed-size meal.
 *
 * Both halves are shown together on purpose: the pair always sums to the same
 * number of pieces, so raising one side necessarily lowers the other. Rendering
 * them apart would hide that and make the counters feel arbitrary.
 *
 * A missing partner means the admin switched that half off; the surviving half
 * then owns the whole total rather than disappearing from the meal.
 */
const PieceMixSection = ({
    group,
    partner,
    error,
    showError,
    quantityOf,
    countInGroup,
    total,
    unit,
    onStep,
}: PieceMixSectionProps) => {
    const name = `piece-mix-${group.id}-${partner?.id ?? "solo"}`;
    const describedBy = showError && error ? `${name}-error` : undefined;
    const assigned = countInGroup(group) + (partner ? countInGroup(partner) : 0);

    // The admin decides which half leads; the other follows it in the list.
    const lead = partner && partner.sort_order < group.sort_order ? partner : group;
    const follow = partner === null ? null : lead === group ? partner : group;

    const sides = [lead, follow].filter((side): side is OptionGroup => side !== null).map((side) => {
        // Each side holds its pieces on its first available value, which is what
        // stepQuantity writes to.
        const value = sortedValues(side)[0];
        if (!value) return null;
        // The pair's total is fixed, so raising one side is only possible while
        // the other side still has a piece to give. `assigned < total` is never
        // true after the first step (stepQuantity always restores the total), so
        // gating on it would leave both + buttons permanently dead.
        const otherValue = follow === null ? undefined : sortedValues(follow)[0];
        const canIncrement =
            follow === null ? assigned < total : otherValue !== undefined && quantityOf(otherValue.id) > 0;
        return (
            <Counter
                key={side.id}
                label={side.name}
                count={quantityOf(value.id)}
                group={side}
                valueID={value.id}
                canDecrement={quantityOf(value.id) > 0}
                canIncrement={canIncrement}
                onStep={onStep}
            />
        );
    });

    return (
        <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-2 flex w-full flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    {lead.name.replace(/\s*pieces?$/i, "")}
                    {follow ? ` / ${follow.name.replace(/\s*pieces?$/i, "")}` : ""}
                </span>
                <span
                    className={`ml-auto whitespace-nowrap text-xs font-bold tabular-nums ${
                        assigned === total ? "text-brand" : "text-muted-foreground"
                    }`}
                >
                    {assigned} / {total} {unit}
                </span>
            </legend>

            <div
                role="group"
                aria-label={
                    follow
                        ? `Split ${total} ${unit} between ${lead.name} and ${follow.name}`
                        : `Choose up to ${total} ${unit} of ${lead.name}`
                }
                aria-describedby={describedBy}
                className={`grid gap-2 ${follow ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
            >
                {sides}
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
                {follow
                    ? `This meal comes with ${total} ${unit}. Adding to one side takes from the other.`
                    : `This meal comes with ${total} ${unit}.`}
            </p>

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

export default memo(PieceMixSection);
