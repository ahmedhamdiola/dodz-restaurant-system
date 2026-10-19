import { useState, type ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { AdminUserRole, Branch, CreateAdminUserInput } from "../types";

const ROLE_OPTIONS: Array<{ value: AdminUserRole; label: string }> = [
    { value: "customer", label: "Customer" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin (full access)" },
    { value: "branch_admin", label: "Branch admin" },
];

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    role: "staff" as AdminUserRole,
    branchId: null as number | null,
    password: "",
};

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const errorInputClass =
    "w-full rounded-lg border border-red-500 bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

interface UserFormModalProps {
    branches: Branch[];
    isSaving: boolean;
    onClose: () => void;
    onSave: (values: CreateAdminUserInput) => void;
}

const UserFormModal = ({ branches, isSaving, onClose, onSave }: UserFormModalProps) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

    const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

    // Mirrors the server rules (required name/email, branch for branch admins,
    // 8-character password) so the admin does not need a round trip to be told.
    const validate = (): boolean => {
        const next: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
        if (!form.name.trim()) next.name = "Name is required";
        if (!form.email.trim()) next.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
        if (form.role === "branch_admin" && !form.branchId) next.branchId = "Pick the branch this admin runs";
        if (form.password.length < 8) next.password = "At least 8 characters";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            role: form.role,
            branchId: form.role === "branch_admin" ? form.branchId : null,
            password: form.password,
        });
    };

    const handleChange =
        (key: "name" | "email" | "phone" | "password") => (event: ChangeEvent<HTMLInputElement>) =>
            set(key, event.target.value);

    const roleHint =
        form.role === "branch_admin"
            ? "Sees only their branch's stock and order view, and can message the main office."
            : form.role === "admin"
              ? "Full access to the whole dashboard, every branch, users and coupons."
              : form.role === "staff"
                ? "Dashboard access without the admin-only management screens."
                : "A regular storefront customer account.";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Create an account"
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">New Account</h2>
                        <p className="text-xs text-muted-foreground">
                            Create a staff or branch-admin login with a password.
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
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Name</span>
                            <input
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="Salma Fathy"
                                className={errors.name ? errorInputClass : inputClass}
                            />
                            {errors.name && <span className="text-xs font-medium text-red-500">{errors.name}</span>}
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Phone</span>
                            <input
                                value={form.phone}
                                onChange={handleChange("phone")}
                                placeholder="01012345678"
                                dir="ltr"
                                className={inputClass}
                            />
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={handleChange("email")}
                            placeholder="salma@dodz.com"
                            dir="ltr"
                            className={errors.email ? errorInputClass : inputClass}
                        />
                        {errors.email && <span className="text-xs font-medium text-red-500">{errors.email}</span>}
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Role</span>
                            <select
                                value={form.role}
                                onChange={(event) => {
                                    const role = event.target.value as AdminUserRole;
                                    setForm((prev) => ({
                                        ...prev,
                                        role,
                                        branchId: role === "branch_admin" ? prev.branchId : null,
                                    }));
                                    setErrors({});
                                }}
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                {ROLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Password
                            </span>
                            <input
                                type="password"
                                value={form.password}
                                onChange={handleChange("password")}
                                placeholder="At least 8 characters"
                                dir="ltr"
                                className={errors.password ? errorInputClass : inputClass}
                            />
                            {errors.password && (
                                <span className="text-xs font-medium text-red-500">{errors.password}</span>
                            )}
                        </label>
                    </div>

                    {form.role === "branch_admin" && (
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Branch
                            </span>
                            <select
                                value={form.branchId ?? ""}
                                onChange={(event) => set("branchId", event.target.value === "" ? null : Number(event.target.value))}
                                className={`${inputClass} cursor-pointer appearance-none`}
                            >
                                <option value="">Select a branch…</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name} — {branch.area}
                                    </option>
                                ))}
                            </select>
                            {errors.branchId && (
                                <span className="text-xs font-medium text-red-500">{errors.branchId}</span>
                            )}
                        </label>
                    )}

                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">{roleHint}</p>
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
                        {isSaving ? "Creating…" : "Create account"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default UserFormModal;
