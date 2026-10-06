import { lazy, Suspense, useRef, useState, type FormEvent } from "react";
import { CheckIcon, ChevronDownIcon, TagIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { formatPrice } from "../../../lib/format";
import { useAuth } from "../../auth/hooks/useAuth";
import { useOrderLocation } from "../../order-location/useOrderLocation";
import { queryClient } from "../../../lib/queryClient";
import { useCart, useCheckout, useValidateCoupon } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";
import type { CouponQuote } from "../services/couponApi";
import type { OrderView } from "../types";

const LocationPickerModal = lazy(
    () => import("../../order-location/components/LocationPickerModal")
);

const PHONE_REGEX = /^01[0-9]{9}$/;

const normalizeClientPhone = (raw: string): string | null => {
    let phone = raw.replace(/[\s\-()]/g, "");
    if (phone.startsWith("+20")) {
        phone = phone.slice(3);
    } else if (phone.startsWith("20")) {
        phone = phone.slice(2);
    }
    if (phone.startsWith("1") && phone.length === 10) {
        phone = `0${phone}`;
    }
    return PHONE_REGEX.test(phone) ? phone : null;
};

const makeIdempotencyKey = (): string =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ik_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

interface CheckoutFormProps {
    onSuccess: (order: OrderView) => void;
    onCancel: () => void;
}

export const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
    const { user } = useAuth();
    const { selection } = useOrderLocation();
    const checkout = useCheckout();
    const { data: cart } = useCart();
    const validateCoupon = useValidateCoupon();

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [error, setError] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponQuote | null>(null);
    const idempotencyKeyRef = useRef<string>(makeIdempotencyKey());

    /**
     * The quoted discount is not spent here and is not trusted. Checkout
     * re-applies the same code inside the transaction against the re-priced
     * cart, so a code that expired in between fails there with a real message
     * instead of quietly pricing the order without it.
     */
    const applyCoupon = () => {
        const code = couponInput.trim();
        if (!code) return;

        setCouponError(null);
        validateCoupon.mutate(
            code,
            cart?.subtotal ?? 0,
            0,
            {
                onSuccess: (quote) => {
                    setAppliedCoupon(quote);
                    setCouponInput("");
                },
                onError: (err) => {
                    setAppliedCoupon(null);
                    setCouponError(getCartErrorMessage(err, "That code could not be applied."));
                },
            }
        );
    };

    const clearCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
        setCouponInput("");
    };

    const place = (order: OrderView) => {
        // The order now exists server-side; refresh the account's order history
        // (react-query) while the Redux cart cache was already cleared by the API.
        if (user) {
            void queryClient.invalidateQueries({ queryKey: ["profile", "orders"] });
        }
        onSuccess(order);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!selection) {
            setError("Select a branch before checking out.");
            return;
        }
        if (!trimmedName) {
            setError("Please enter your name.");
            return;
        }

        let normalizedPhone: string | null = null;
        if (phone.trim()) {
            normalizedPhone = normalizeClientPhone(phone.trim());
            if (!normalizedPhone) {
                setError("Phone must be a valid Egyptian mobile number (e.g. 01012345678).");
                return;
            }
        }

        setError(null);
        checkout.mutate(
            {
                branchID: selection.branchId,
                customerName: trimmedName,
                customerPhone: normalizedPhone ?? undefined,
                orderType: selection.mode === "delivery" ? "Delivery" : "Pickup",
                deliveryAddress: selection.mode === "delivery" ? selection.address ?? undefined : undefined,
                deliveryLat: selection.mode === "delivery" && typeof selection.lat === "number" ? selection.lat : undefined,
                deliveryLng: selection.mode === "delivery" && typeof selection.lng === "number" ? selection.lng : undefined,
                couponCode: appliedCoupon?.couponCode,
                idempotencyKey: idempotencyKeyRef.current,
            },
            {
                onSuccess: place,
                onError: (err) => setError(getCartErrorMessage(err, "Could not place your order. Please try again.")),
            }
        );
    };

    const inputClass = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-secondary outline-none transition-colors focus:border-brand placeholder:text-muted-foreground";

    return (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/50">
                    {error}
                </p>
            )}

            <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Branch</span>
                {selection ? (
                    <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-secondary transition-colors hover:border-brand"
                    >
                        <span className="truncate">
                            {selection.mode === "delivery" ? selection.area : selection.branchName}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="w-full cursor-pointer rounded-lg border border-dashed border-brand px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
                    >
                        Select a branch to continue
                    </button>
                )}
            </div>

            <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</span>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className={inputClass}
                />
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone {!user && <span className="normal-case text-muted-foreground/70">(optional)</span>}
                </span>
                <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01012345678"
                    inputMode="tel"
                    autoComplete="tel"
                    className={inputClass}
                />
            </label>

            <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Promo code
                </span>
                {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-brand bg-brand/5 px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-secondary">
                            <CheckIcon className="h-4 w-4 shrink-0 text-brand" />
                            <span className="truncate">{appliedCoupon.couponCode}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                −{formatPrice(appliedCoupon.discount)}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={clearCoupon}
                            className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-secondary"
                            aria-label="Remove promo code"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponInput}
                            onChange={(event) => setCouponInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    applyCoupon();
                                }
                            }}
                            placeholder="Enter code"
                            autoCapitalize="characters"
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={validateCoupon.isPending || !couponInput.trim()}
                            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <TagIcon className="h-4 w-4" />
                            {validateCoupon.isPending ? "…" : "Apply"}
                        </button>
                    </div>
                )}
                {couponError && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {couponError}
                    </p>
                )}
            </div>

            <div className="mt-1 flex gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={checkout.isPending}
                    className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={checkout.isPending}
                    className="flex-1 cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {checkout.isPending ? "Placing order…" : "Place order"}
                </button>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
                You can pay when your order arrives. Retrying after a network hiccup won't create a duplicate order.
            </p>

            <Suspense fallback={null}>
                <LocationPickerModal open={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
            </Suspense>
        </form>
    );
};