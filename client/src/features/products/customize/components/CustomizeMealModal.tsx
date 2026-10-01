import { useRef, useState } from "react";
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    MinusIcon,
    PlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useScrollLock } from "../../../../components/navbar/hooks/useScrollLock";
import { useEscapeKey } from "../../../../components/sidebar/hooks/useEscapeKey";
import { useToast } from "../../../../components/toast/context";
import { formatPrice } from "../../../../lib/format";
import { useCartUI } from "../../../cart/cartUIContext";
import { MAX_QUANTITY } from "../../../cart/types";
import { useFocusTrap } from "../../../cart/hooks/useFocusTrap";
import { useAddItem } from "../../../cart/hooks/useCart";
import { getCartErrorMessage } from "../../../cart/services/cartApi";
import { useCustomizeUI } from "../customizeContext";
import { effectiveMin } from "../lib/selection";
import { useProductOptions } from "../hooks/useProductOptions";
import { useCustomizeMeal } from "../hooks/useCustomizeMeal";
import { useSessionKey } from "../hooks/useSessionKey";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { quantityPair } from "../lib/selection";
import CustomizeSkeleton from "./CustomizeSkeleton";
import OptionGroupSection from "./OptionGroupSection";
import PieceMixSection from "./PieceMixSection";

const TITLE_ID = "customize-meal-title";
const DESCRIPTION_ID = "customize-meal-description";

const stepperButton =
    "flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

/**
 * The "Customize Your Meal" modal — a bottom sheet on phones, a centered dialog
 * from `sm` up. It stays mounted and is driven by transform/opacity so both the
 * enter and the exit transition play, with `inert` + `aria-hidden` while closed.
 */
export const CustomizeMealModal = () => {
    const { product, isOpen, close } = useCustomizeUI();
    const { notifyAdded } = useCartUI();
    const toast = useToast();
    const panelRef = useRef<HTMLDivElement>(null);
    const addItem = useAddItem();

    const productID = product?.id ?? null;
    const sessionKey = useSessionKey(isOpen, productID);
    const options = useProductOptions(productID);
    const groups = options.data ?? [];
    // Only a fresh load (not a background refetch) should re-seed the defaults.
    const loadedStamp = options.isSuccess ? `${productID}` : "";

    const meal = useCustomizeMeal(groups, `${sessionKey}|${loadedStamp}`);

    const [quantity, setQuantity] = useState(1);
    const [serverError, setServerError] = useState<string | null>(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [prevSession, setPrevSession] = useState(sessionKey);
    if (sessionKey !== prevSession) {
        setPrevSession(sessionKey);
        setQuantity(1);
        setServerError(null);
        setSubmitAttempted(false);
    }

    useScrollLock(isOpen);
    useEscapeKey(isOpen, close);
    useFocusTrap(panelRef, isOpen);

    const basePrice = product?.price ?? 0;
    const unitPrice = basePrice + meal.extras;
    const total = unitPrice * quantity;
    const animatedTotal = useAnimatedNumber(total);
    const isAdding = addItem.isPending;
    // `options.isSuccess` is load-bearing, not redundant with `meal.isValid`.
    // `meal.isValid` is derived from `visible`, which is empty while the request is
    // in flight and stays empty on failure, so both look like a "plain product with
    // no choices" and would let the customer pay for an unchecked customisation.
    const canSubmit = isOpen && product !== null && options.isSuccess && meal.isValid && !isAdding;

    const submit = () => {
        if (product === null) return;
        if (!meal.isValid) {
            setSubmitAttempted(true);
            return;
        }
        setServerError(null);
        addItem.mutate(
            {
                productID: product.id,
                quantity,
                ...(meal.valueIDs.length > 0 ? { optionValueIDs: meal.valueIDs } : {}),
                ...(meal.quantityList.length > 0
                    ? { optionQuantities: meal.quantityList }
                    : {}),
            },
            {
                onSuccess: () => {
                    close();
                    notifyAdded();
                    toast.success(
                        meal.pickCount > 0
                            ? `${product.name} added with ${meal.pickCount} choice${
                                  meal.pickCount === 1 ? "" : "s"
                              }`
                            : `${product.name} added to cart`
                    );
                },
                onError: (err) => {
                    setServerError(
                        getCartErrorMessage(err, "Could not add this meal to your cart.")
                    );
                },
            }
        );
    };

    /**
     * A counted pair is rendered ONCE, showing both halves together, so the two
     * steppers can be read against each other. The partner is tracked here rather
     * than filtered out of the list, which keeps the admin's sort order intact for
     * every other group.
     */
    const renderedPairs = new Set<number>();
    const renderGroups = () =>
        meal.groups.map((group) => {
            const error = meal.errors[group.id];
            const showError = Boolean(
                error && (submitAttempted || effectiveMin(group) > 0 || meal.isTouched(group))
            );

            if (meal.isCounted(group)) {
                const pair = quantityPair(meal.groups, group);
                if (pair) {
                    if (renderedPairs.has(pair.group.id) || renderedPairs.has(pair.partner.id)) {
                        return null;
                    }
                    renderedPairs.add(pair.group.id);
                    renderedPairs.add(pair.partner.id);
                }
                // No pair means the admin switched the other half off. The group
                // still belongs to the meal and the server still honours its total,
                // so it is rendered as a single counter rather than vanishing —
                // dropping it would silently change what the customer ordered.
                const lead = pair?.group ?? group;
                const partner = pair?.partner ?? null;
                return (
                    <PieceMixSection
                        key={pair ? `pair-${pair.group.id}-${pair.partner.id}` : `solo-${group.id}`}
                        group={lead}
                        partner={partner}
                        error={pair ? meal.errors[pair.partner.id] ?? error : error}
                        showError={Boolean(
                            error &&
                                (submitAttempted ||
                                    meal.isTouched(pair?.group ?? group) ||
                                    (partner !== null && meal.isTouched(partner)))
                        )}
                        quantityOf={meal.quantityOf}
                        countInGroup={meal.countInGroup}
                        total={meal.totalFor(lead)}
                        unit={lead.unit_label?.trim() || "pieces"}
                        onStep={(side, valueID, delta) => {
                            meal.touch(side);
                            meal.step(side, valueID, delta);
                        }}
                    />
                );
            }

            return (
                <OptionGroupSection
                    key={group.id}
                    group={group}
                    error={error}
                    showError={showError}
                    selectedCount={meal.countFor(group)}
                    isSaturated={meal.isSaturated(group)}
                    has={(valueID) => meal.has(group, valueID)}
                    onPickRadio={(valueID) => {
                        meal.touch(group);
                        meal.pickRadio(group, valueID);
                    }}
                    onToggleCheck={(valueID, select) => {
                        meal.touch(group);
                        meal.toggleCheck(group, valueID, select);
                    }}
                />
            );
        });

    return (
        <div
            className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
            aria-hidden={!isOpen}
        >
            <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                onClick={close}
                aria-label="Close customizer"
                className={`absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={TITLE_ID}
                aria-describedby={DESCRIPTION_ID}
                inert={!isOpen}
                tabIndex={-1}
                className={`
                    absolute inset-x-0 bottom-0 flex max-h-[92dvh] w-full flex-col overflow-hidden
                    rounded-t-2xl border border-border bg-card text-secondary shadow-2xl shadow-black/40
                    transition-[transform,opacity] duration-300 ease-out
                    sm:inset-0 sm:m-auto sm:max-h-[88dvh] sm:max-w-2xl sm:rounded-2xl
                    ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-95 sm:opacity-0"}
                    ${isOpen ? "" : "pointer-events-none"}
                `}
            >
                <header className="relative flex items-start gap-3 border-b border-border px-4 pb-3.5 pt-4 sm:px-5 sm:pt-4">
                    <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-muted sm:hidden"
                    />
                    {product && (
                        <>
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                                <img
                                    src={product.image}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <h2
                                    id={TITLE_ID}
                                    className="line-clamp-1 text-base font-bold tracking-tight sm:text-lg"
                                >
                                    {product.name}
                                </h2>
                                <p
                                    id={DESCRIPTION_ID}
                                    className="mt-0.5 line-clamp-2 text-xs text-muted-foreground"
                                >
                                    {product.description || "Make it exactly how you like it."}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                    Base{" "}
                                    <span className="text-secondary">{formatPrice(basePrice)}</span>
                                </p>
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close customizer"
                        className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </header>

                <div className="scrollbar-slim flex-1 overscroll-contain overflow-y-auto px-4 py-4 sm:px-5">
                    {serverError && (
                        <p
                            role="alert"
                            className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-500"
                        >
                            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                            {serverError}
                        </p>
                    )}

                    {options.isError ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-500/70" />
                            <p className="max-w-[260px] text-sm text-muted-foreground">
                                We couldn't load the choices for this meal.
                            </p>
                            <button
                                type="button"
                                onClick={() => void options.refetch()}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-muted"
                            >
                                <ArrowPathIcon className="h-3.5 w-3.5" />
                                Try again
                            </button>
                        </div>
                    ) : !options.isSuccess ? (
                        <CustomizeSkeleton />
                    ) : meal.groups.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            This item has no customizations — add it as it is.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {renderGroups()}
                        </div>
                    )}
                </div>

                <footer className="border-t border-border bg-card px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center justify-between gap-4 sm:justify-start">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Total
                                </p>
                                <p className="whitespace-nowrap text-lg font-bold tracking-tight tabular-nums">
                                    {formatPrice(animatedTotal)}
                                </p>
                                {meal.extras > 0 && (
                                    <p className="whitespace-nowrap text-[11px] text-muted-foreground">
                                        {formatPrice(basePrice)} + {formatPrice(meal.extras)} extras
                                    </p>
                                )}
                            </div>

                            <div
                                className="flex shrink-0 items-center rounded-full border border-border bg-muted/60"
                                role="group"
                                aria-label="Quantity"
                            >
                                <button
                                    type="button"
                                    className={stepperButton}
                                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="min-w-7 text-center text-sm font-bold tabular-nums">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    className={stepperButton}
                                    onClick={() =>
                                        setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))
                                    }
                                    disabled={quantity >= MAX_QUANTITY}
                                    aria-label="Increase quantity"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={submit}
                            disabled={!canSubmit}
                            className="w-full shrink-0 cursor-pointer rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-3"
                        >
                            {isAdding ? "Adding…" : "Add to cart"}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
