import { useState, type ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "../../../lib/format";
import { toDateInputValue } from "../services/couponsApi";
import type { AdminCoupon, CouponInput, CouponType } from "../types";

const TYPE_OPTIONS: Array<{ value: CouponType; label: string; hint: string }> = [
    { value: "percentage", label: "Percentage off", hint: "Takes a percentage off the subtotal." },
    {
        value: "fixed_amount",
        label: "Fixed amount off",
        hint: "Takes a flat amount off. Never takes the total below zero.",
    },
    {
        value: "free_delivery",
        label: "Free delivery",
        hint: "Waives the serving branch's delivery fee. Worth nothing on pickup.",
    },
];

/** One month out, so a new coupon is not born expired. */
const defaultExpiry = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return toDateInputValue(date.toISOString());
};

const EMPTY_FORM: CouponInput = {
    code: "",
    name: "",
    type: "percentage",
    value: 10,
    minOrderAmount: 0,
    maxUses: null,
    isActive: true,
    expiresAt: defaultExpiry(),
};

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const errorInputClass =
    "w-full rounded-lg border border-red-500 bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

interface CouponFormModalProps {
    initialValues?: AdminCoupon | null;
    isSaving: boolean;
    onClose: () => void;
    onSave: (values: CouponInput) => void;
}

const CouponFormModal = ({ initialValues = null, isSaving, onClose, onSave }: CouponFormModalProps) => {
    const [form, setForm] = useState<CouponInput>(
        initialValues
            ? {
                  code: initialValues.code,
                  name: initialValues.name,
                  type: initialValues.type,
                  value: initialValues.value,
                  minOrderAmount: initialValues.minOrderAmount,
                  maxUses: initialValues.maxUses,
                  isActive: initialValues.isActive,
                  expiresAt: toDateInputValue(initialValues.expiresAt),
              }
            : EMPTY_FORM
    );
    const [errors, setErrors] = useState<Partial<Record<keyof CouponInput, string>>>({});

    const set = <K extends keyof CouponInput>(key: K, value: CouponInput[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

    /**
     * Mirrors the server's rules so the author gets an answer without a round
     * trip. The server validates independently; this is convenience, not the
     * guarantee.
     */
    const validate = (): boolean => {
        const next: Partial<Record<keyof CouponInput, string>> = {};
        if (!form.code.trim()) next.code = "Code is required";
        else if (form.code.trim().length > 32) next.code = "32 characters or fewer";
        if (!form.name.trim()) next.name = "Name is required";

        if (form.type === "percentage") {
            if (!(form.value > 0) || form.value > 100) next.value = "Between 1 and 100";
        } else if (form.type === "fixed_amount") {
            if (!(form.value > 0)) next.value = "Must be more than zero";
        } else if (form.value !== 0) {
            // Free delivery has no amount to store: the branch sets the fee.
            setForm((prev) => ({ ...prev, value: 0 }));
            next.value = undefined;
        }

        if (form.minOrderAmount < 0) next.minOrderAmount = "Cannot be negative";
        if (form.maxUses !== null && form.maxUses < 1) next.maxUses = "At least 1";
        if (!form.expiresAt) next.expiresAt = "Pick an expiry date";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({
            ...form,
            code: form.code.trim(),
            name: form.name.trim(),
            maxUses: form.maxUses === null ? null : Math.floor(form.maxUses),
        });
    };

    const handleChange =
        (key: keyof CouponInput) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const raw = event.target.value;
            const numeric = key === "value" || key === "minOrderAmount" || key === "maxUses";
            set(key, (numeric ? (raw === "" ? 0 : Number(raw)) : raw) as CouponInput[typeof key]);
        };

    const selectedType = TYPE_OPTIONS.find((option) => option.value === form.type);
    const valueLabel = form.type === "percentage" ? "Percentage" : "Amount";
    const valueSuffix = form.type === "percentage" ? "%" : "EGP";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={initialValues ? `Edit ${initialValues.name}` : "Create a coupon"}
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                            {initialValues ? "Edit Coupon" : "New Coupon"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {initialValues
                                ? "Editing a coupon never changes what past orders were charged."
                                : "Customers enter this code at checkout."}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Code</span>
                            <input
                                value={form.code}
                                onChange={handleChange("code")}
                                placeholder="LAUNCH20"
                                autoCapitalize="characters"
                                dir="ltr"
                                className={errors.code ? errorInputClass : inputClass}
                            />
                            {errors.code && <span className="text-xs font-medium text-red-500">{errors.code}</span>}
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Type</span>
                            <select
                                value={form.type}
                                onChange={(event) => {
                                    const type = event.target.value as CouponType;
                                    // Reset the amount on a type change so a stale
                                    // percentage cannot be saved as a currency amount.
                                    setForm((prev) => ({
                                        ...prev,
                                        type,
                                        value: type === "free_delivery" ? 0 : type === "percentage" ? 10 : 50,
                                    }));
                                    setErrors({});
                                }}
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                {TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Name</span>
                        <input
                            value={form.name}
                            onChange={handleChange("name")}
                            placeholder="Launch week offer"
                            className={errors.name ? errorInputClass : inputClass}
                        />
                        {errors.name && <span className="text-xs font-medium text-red-500">{errors.name}</span>}
                    </label>

                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        {selectedType?.hint}
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {form.type !== "free_delivery" && (
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                    {valueLabel} ({valueSuffix})
                                </span>
                                <input
                                    type="number"
                                    min={form.type === "percentage" ? 1 : 0}
                                    max={form.type === "percentage" ? 100 : undefined}
                                    step="any"
                                    value={Number.isFinite(form.value) ? form.value : 0}
                                    onChange={handleChange("value")}
                                    dir="ltr"
                                    className={errors.value ? errorInputClass : inputClass}
                                />
                                {errors.value && (
                                    <span className="text-xs font-medium text-red-500">{errors.value}</span>
                                )}
                            </label>
                        )}

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Minimum spend (EGP)
                            </span>
                            <input
                                type="number"
                                min={0}
                                step="any"
                                value={Number.isFinite(form.minOrderAmount) ? form.minOrderAmount : 0}
                                onChange={handleChange("minOrderAmount")}
                                dir="ltr"
                                className={errors.minOrderAmount ? errorInputClass : inputClass}
                            />
                            {errors.minOrderAmount && (
                                <span className="text-xs font-medium text-red-500">{errors.minOrderAmount}</span>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Max uses
                            </span>
                            <input
                                type="number"
                                min={1}
                                step="1"
                                value={form.maxUses ?? ""}
                                onChange={(event) =>
                                    set("maxUses", event.target.value === "" ? null : Number(event.target.value))
                                }
                                placeholder="Unlimited"
                                dir="ltr"
                                className={errors.maxUses ? errorInputClass : inputClass}
                            />
                            {errors.maxUses && (
                                <span className="text-xs font-medium text-red-500">{errors.maxUses}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Expires on
                            </span>
                            <input
                                type="date"
                                value={form.expiresAt}
                                onChange={handleChange("expiresAt")}
                                className={errors.expiresAt ? errorInputClass : inputClass}
                            />
                            {errors.expiresAt && (
                                <span className="text-xs font-medium text-red-500">{errors.expiresAt}</span>
                            )}
                        </label>
                    </div>

                    <label className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) => set("isActive", event.target.checked)}
                            className="h-4 w-4 cursor-pointer accent-brand"
                        />
                        <span className="text-sm text-secondary">
                            Active
                            <span className="block text-xs text-muted-foreground">
                                An inactive or expired code cannot be entered at checkout.
                            </span>
                        </span>
                    </label>
                </div>

                <footer className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Saving…" : initialValues ? "Save changes" : "Create coupon"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CouponFormModal;
export { formatPrice };
