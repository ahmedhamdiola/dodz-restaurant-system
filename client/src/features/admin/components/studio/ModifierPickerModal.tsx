import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowPathIcon,
    CheckIcon,
    LinkSlashIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatPrice } from "../../../../lib/format";
import { useOptionModifiers } from "../../hooks/useProductOptionsAdmin";
import { useScrollLock } from "../../../../components/navbar/hooks/useScrollLock";
import { useFocusTrap } from "../../../cart/hooks/useFocusTrap";
import type { ModifierProduct } from "../../../products/customize/types";

interface ModifierPickerModalProps {
    open: boolean;
    onClose: () => void;
    /** Currently linked modifier, so the admin can re-pick or unlink. */
    current: ModifierProduct | null;
    onSelect: (modifier: ModifierProduct | null) => void;
}

const DEBOUNCE_MS = 300;

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

/**
 * Searchable image grid of hidden modifier products. Search is debounced so
 * typing a long name doesn't hammer the endpoint, and Escape is handled in the
 * capture phase so it closes this dialog without also closing the ProductModal
 * underneath (whose listener sits in the bubble phase).
 */
const ModifierPickerModal = ({ open, onClose, current, onSelect }: ModifierPickerModalProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");
    const [term, setTerm] = useState("");

    const { data: modifiers = [], isLoading, isError, refetch } = useOptionModifiers(open);

    useScrollLock(open);
    useFocusTrap(panelRef, open);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            event.stopPropagation();
            onClose();
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [open, onClose]);

    // Debounce the search box into the value used for filtering.
    useEffect(() => {
        if (search === term) return;
        const timer = setTimeout(() => setTerm(search), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search, term]);

    const visible = useMemo(() => {
        const needle = term.trim().toLowerCase();
        if (!needle) return modifiers;
        return modifiers.filter(
            (modifier) =>
                modifier.name.toLowerCase().includes(needle) ||
                modifier.category_name.toLowerCase().includes(needle)
        );
    }, [modifiers, term]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Link a modifier product"
                tabIndex={-1}
                className="relative flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
            >
                <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-tight text-secondary">
                            Link Modifier Product
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Hidden add-ons (cheese, vegetables, sauces) never show on the storefront
                            menu.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex flex-col gap-3 px-5 py-4">
                    <label className="relative block">
                        <span className="sr-only">Search modifier products</span>
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search cheese, sauces, extras…"
                            className={`${inputClass} pl-9`}
                        />
                    </label>

                    {current && (
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(null);
                                onClose();
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-left text-xs font-semibold text-muted-foreground transition-colors hover:border-red-500 hover:text-red-500"
                        >
                            <LinkSlashIcon className="h-4 w-4 shrink-0" />
                            Unlink “{current.name}” from this choice
                        </button>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[0, 1, 2, 3, 4, 5].map((cell) => (
                                <div
                                    key={cell}
                                    className="h-28 animate-pulse rounded-lg border border-border bg-muted/60"
                                />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                Couldn't load modifier products.
                            </p>
                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                            >
                                <ArrowPathIcon className="h-3.5 w-3.5" />
                                Retry
                            </button>
                        </div>
                    ) : visible.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            {modifiers.length === 0
                                ? "No modifier products yet — create hidden products first."
                                : `Nothing matches “${term.trim()}”.`}
                        </p>
                    ) : (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {visible.map((modifier) => {
                                const isCurrent = current?.id === modifier.id;
                                return (
                                    <li key={modifier.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelect(modifier);
                                                onClose();
                                            }}
                                            aria-pressed={isCurrent}
                                            className={`flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all ${
                                                isCurrent
                                                    ? "border-brand ring-2 ring-brand/40"
                                                    : "border-border hover:border-brand/60"
                                            }`}
                                        >
                                            <span className="flex h-24 w-full items-center justify-center overflow-hidden bg-muted">
                                                {modifier.image ? (
                                                    <img
                                                        src={modifier.image}
                                                        alt=""
                                                        loading="lazy"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        No image
                                                    </span>
                                                )}
                                            </span>
                                            <span className="flex flex-1 flex-col gap-0.5 p-2">
                                                <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-secondary">
                                                    {modifier.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {modifier.category_name}
                                                </span>
                                                <span className="mt-auto flex items-center justify-between gap-1 pt-1">
                                                    <span className="text-[11px] font-bold text-secondary">
                                                        {formatPrice(modifier.price)}
                                                    </span>
                                                    {!modifier.is_available && (
                                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                                                            Off
                                                        </span>
                                                    )}
                                                    {isCurrent && (
                                                        <CheckIcon className="h-3.5 w-3.5 text-brand" />
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModifierPickerModal;
