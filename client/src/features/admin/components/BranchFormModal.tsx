import { useState, type ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { AdminBranch } from "../types";

export type BranchFormValues = Omit<AdminBranch, "id">;

const EMPTY_FORM: BranchFormValues = {
    name: "",
    area: "",
    address: "",
    hours: "Open daily",
    phone: "16974",
    status: "Open",
};

const LABELS: Record<keyof BranchFormValues, string> = {
    name: "Branch Name",
    area: "Area",
    address: "Address",
    hours: "Working Hours",
    phone: "Hotline",
    status: "Status",
};

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const errorInputClass =
    "w-full rounded-lg border border-red-500 bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

interface BranchFormModalProps {
    initialValues?: AdminBranch | null;
    onClose: () => void;
    onSave: (values: BranchFormValues, id?: number) => void;
}

const BranchFormModal = ({ initialValues = null, onClose, onSave }: BranchFormModalProps) => {
    const [form, setForm] = useState<BranchFormValues>(initialValues ?? EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof BranchFormValues, string>>>({});

    const handleChange =
        (key: keyof BranchFormValues) =>
        (
            event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        ) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
            setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
        };

    const handleSubmit = () => {
        const newErrors: Partial<Record<keyof BranchFormValues, string>> = {};
        for (const key of ["name", "area", "address", "hours", "phone"] as Array<
            keyof BranchFormValues
        >) {
            if (!form[key].trim()) newErrors[key] = `${LABELS[key]} is required`;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(form, initialValues?.id);
    };

    const errorClass = (key: keyof BranchFormValues) =>
        errors[key] ? errorInputClass : inputClass;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={initialValues ? `Edit ${initialValues.name}` : "Add a new branch"}
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                            {initialValues ? "Edit Branch" : "Add Branch"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {initialValues
                                ? "Update the details for this branch."
                                : "Fill in the details to open a new branch."}
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
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            {LABELS.name}
                        </span>
                        <input
                            value={form.name}
                            onChange={handleChange("name")}
                            placeholder="DODZ El Giza"
                            className={errorClass("name")}
                        />
                        {errors.name && (
                            <span className="text-xs font-medium text-red-500">{errors.name}</span>
                        )}
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                {LABELS.area}
                            </span>
                            <input
                                value={form.area}
                                onChange={handleChange("area")}
                                placeholder="Giza"
                                className={errorClass("area")}
                            />
                            {errors.area && (
                                <span className="text-xs font-medium text-red-500">
                                    {errors.area}
                                </span>
                            )}
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                {LABELS.phone}
                            </span>
                            <input
                                value={form.phone}
                                onChange={handleChange("phone")}
                                placeholder="16974"
                                dir="ltr"
                                className={errorClass("phone")}
                            />
                            {errors.phone && (
                                <span className="text-xs font-medium text-red-500">
                                    {errors.phone}
                                </span>
                            )}
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            {LABELS.address}
                        </span>
                        <textarea
                            value={form.address}
                            onChange={(event) => handleChange("address")(event)}
                            rows={3}
                            placeholder="Street, landmark, mall…"
                            className={`${errorClass("address")} resize-none`}
                        />
                        {errors.address && (
                            <span className="text-xs font-medium text-red-500">
                                {errors.address}
                            </span>
                        )}
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                {LABELS.hours}
                            </span>
                            <input
                                value={form.hours}
                                onChange={handleChange("hours")}
                                placeholder="Open daily · 10:00 AM – 11:00 PM"
                                className={errorClass("hours")}
                            />
                            {errors.hours && (
                                <span className="text-xs font-medium text-red-500">
                                    {errors.hours}
                                </span>
                            )}
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                {LABELS.status}
                            </span>
                            <select
                                value={form.status}
                                onChange={handleChange("status")}
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </label>
                    </div>
                </div>

                <footer className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        {initialValues ? "Save changes" : "Add branch"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BranchFormModal;