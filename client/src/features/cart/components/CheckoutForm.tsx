import { lazy, Suspense, useRef, useState, type FormEvent } from "react";
import { CheckIcon, MapPinIcon, TagIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { formatPrice } from "../../../lib/format";
import { useAuth } from "../../auth/hooks/useAuth";
import { useOrderType } from "../../order/useOrderType";
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
    const { isDelivery } = useOrderType();
    const { selection, setSelection } = useOrderLocation();
    const checkout = useCheckout();
    const { data: cart } = useCart();
    const validateCoupon = useValidateCoupon();

    // A selection made under the other mode (e.g. a pickup branch while the
    // navbar now says Delivery) is not usable for this checkout.
    const deliverySelection = isDelivery && selection?.mode === "delivery" ? selection : null;
    const pickupSelection = !isDelivery && selection?.mode === "pickup" ? selection : null;

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [error, setError] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponQuote | null>(null);
    const idempotencyKeyRef = useRef<string>(makeIdempotencyKey());

    // The address lives in the persisted selection, not component state, so it
    // survives the drawer closing and page reloads (per-account localStorage).
    const address = deliverySelection?.address ?? "";
    const setAddress = (value: string) => {
        if (deliverySelection) setSelection({ ...deliverySelection, address: value.trim() ? value : null });
    };

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
        const trimmedAddress = address.trim();

        if (isDelivery) {
            if (!deliverySelection) {
                setError("Set your delivery location before checking out.");
                return;
            }
            if (!trimmedAddress) {
                setError("Please enter your delivery address.");
                return;
            }
        } else if (!pickupSelection) {
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

        const activeSelection = isDelivery ? deliverySelection : pickupSelection;
        if (!activeSelection) return;

        setError(null);
        checkout.mutate(
            {
                branchID: activeSelection.branchId,
                customerName: trimmedName,
                customerPhone: normalizedPhone ?? undefined,
                orderType: isDelivery ? "Delivery" : "Pickup",
                deliveryAddress: isDelivery ? trimmedAddress : undefined,
                deliveryLat: isDelivery ? activeSelection.lat : undefined,
                deliveryLng: isDelivery ? activeSelection.lng : undefined,
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

            {isDelivery ? (
                <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Delivery address
                    </span>
                    {deliverySelection ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                placeholder="Street, building, floor, landmark…"
                                autoComplete="street-address"
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:border-brand"
                            >
                                <MapPinIcon className="h-4 w-4" />
                                Pin
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                className="w-full cursor-pointer rounded-lg border border-dashed border-brand px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
                            >
                                {user ? "Set your delivery location on the map" : "Pick your location on the map"}
                            </button>
                            {!user && (
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Your pick is saved on this device. Log in to keep it across devices.
                                </p>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Branch</span>
                    {pickupSelection ? (
                        <div className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-secondary">
                            {pickupSelection.branchName}
                        </div>
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
            )}

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
                <LocationPickerModal
                    open={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    offsetLeft
                />
            </Suspense>
        </form>
    );
};