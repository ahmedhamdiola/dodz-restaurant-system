import { memo } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { OptionGroupType, OptionValue } from "../types";
import { formatPrice } from "../../../../lib/format";

interface OptionValueCardProps {
    value: OptionValue;
    type: OptionGroupType;
    name: string;
    checked: boolean;
    /** True when the group's max is already reached (checkbox only). */
    blocked: boolean;
    onSelect: () => void;
}

/**
 * A single selectable option. Uses a real (visually hidden) radio/checkbox input
 * so keyboard semantics, roving focus and screen-reader state all come for free;
 * the card itself is styled with `peer-*` variants so the focus ring is always
 * visible on keyboard focus.
 */
const OptionValueCard = ({
    value,
    type,
    name,
    checked,
    blocked,
    onSelect,
}: OptionValueCardProps) => {
    const soldOut = !value.is_available;
    const disabled = soldOut || (blocked && !checked);
    const delta = Number(value.price_delta) || 0;
    // Must be unique per value: `name` is shared by every value in the group, so
    // deriving the id from it alone would give duplicate ids and every input would
    // resolve `aria-describedby` to whichever description rendered first.
    const descriptionId = `${name}-${value.id}-desc`;

    return (
        <label
            className={`group relative block cursor-pointer ${
                disabled ? "cursor-not-allowed" : ""
            }`}
        >
            <input
                type={type}
                name={name}
                className="peer sr-only"
                checked={checked}
                disabled={disabled}
                onChange={onSelect}
                aria-describedby={value.description ? descriptionId : undefined}
            />
            <span
                className={`
                    flex h-full items-start gap-3 rounded-xl border bg-primary px-3 py-2.5 transition-all duration-200
                    ${
                        disabled
                            ? "border-border opacity-55"
                            : "border-border group-hover:border-brand/60"
                    }
                    peer-checked:border-brand peer-checked:bg-brand/10
                    peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2
                    peer-focus-visible:ring-offset-primary
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border-2 transition-colors duration-200
                        ${type === "radio" ? "rounded-full" : "rounded-md"}
                        ${
                            checked
                                ? "border-brand bg-brand text-white"
                                : "border-muted-foreground/50 bg-transparent text-transparent"
                        }
                    `}
                >
                    <CheckIcon
                        className={type === "radio" ? "h-2.5 w-2.5" : "h-3 w-3"}
                        strokeWidth={4}
                    />
                </span>

                {value.modifier?.image && (
                    <img
                        src={value.modifier.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                )}

                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold leading-tight text-secondary">
                            {value.name}
                        </span>
                        {soldOut ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Sold out
                            </span>
                        ) : (
                            <span
                                className={`whitespace-nowrap text-xs font-bold ${
                                    delta > 0 ? "text-brand" : "text-muted-foreground"
                                }`}
                            >
                                {delta > 0 ? `+${formatPrice(delta)}` : "Free"}
                            </span>
                        )}
                    </span>
                    {value.description && (
                        <span
                            id={descriptionId}
                            className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground"
                        >
                            {value.description}
                        </span>
                    )}
                    {blocked && !soldOut && (
                        <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                            Max selections reached
                        </span>
                    )}
                </span>
            </span>
        </label>
    );
};

export default memo(OptionValueCard);
