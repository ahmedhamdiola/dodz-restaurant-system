import { useState, type ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { MenuCategory, MenuProduct } from "../../../menu/types";

export interface ProductFormValues {
    name: string;
    description: string;
    price: string;
    image: string;
    categorySlug: string;
    isCustomizable: boolean;
}

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const errorInputClass =
    "w-full rounded-lg border border-red-500 bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

interface ProductModalProps {
    categories: MenuCategory[];
    initialValues?: MenuProduct | null;
    defaultCategorySlug: string;
    onClose: () => void;
    onSave: (values: ProductFormValues, id?: number) => void;
}

const ProductModal = ({
    categories,
    initialValues = null,
    defaultCategorySlug,
    onClose,
    onSave,
}: ProductModalProps) => {
    const [form, setForm] = useState<ProductFormValues>({
        name: initialValues?.name ?? "",
        description: initialValues?.description ?? "",
        price: initialValues ? String(initialValues.price) : "",
        image: initialValues?.image ?? "",
        categorySlug: initialValues?.categorySlug ?? defaultCategorySlug,
        isCustomizable: initialValues?.isCustomizable ?? true,
    });
    const [errors, setErrors] = useState<
        Partial<Record<"name" | "price" | "categorySlug", string>>
    >({});

    const update =
        (key: keyof ProductFormValues) =>
        (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
            if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
        };

    const handleSubmit = () => {
        const newErrors: typeof errors = {};
        if (!form.name.trim()) newErrors.name = "Product name is required";
        const price = Number(form.price);
        if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
            newErrors.price = "Enter a valid price above 0";
        }
        if (!form.categorySlug) newErrors.categorySlug = "Choose a category";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(
            { ...form, name: form.name.trim(), image: form.image.trim() },
            initialValues?.id
        );
    };

    const categoryName =
        categories.find((category) => category.slug === form.categorySlug)?.name ?? "";

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
                aria-label={initialValues ? `Edit ${initialValues.name}` : "Add a new product"}
                className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                            {initialValues ? "Edit Product" : "Add Product"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {initialValues
                                ? "Tweak the attributes and hit save."
                                : "Ships with the currently selected category."}
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:w-28">
                            {form.image ? (
                                <img
                                    src={form.image}
                                    alt="Product preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-muted-foreground">No image</span>
                            )}
                        </div>
                        <label className="flex flex-1 flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Product Name
                            </span>
                            <input
                                value={form.name}
                                onChange={update("name")}
                                placeholder="e.g. Breakfast Combo"
                                className={errors.name ? errorInputClass : inputClass}
                            />
                            {errors.name && (
                                <span className="text-xs font-medium text-red-500">
                                    {errors.name}
                                </span>
                            )}
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            Image URL
                        </span>
                        <input
                            value={form.image}
                            onChange={update("image")}
                            placeholder="https://…"
                            dir="ltr"
                            className={inputClass}
                        />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Price (EGP)
                            </span>
                            <input
                                value={form.price}
                                onChange={update("price")}
                                type="number"
                                min="1"
                                step="0.5"
                                placeholder="0.00"
                                dir="ltr"
                                className={errors.price ? errorInputClass : inputClass}
                            />
                            {errors.price && (
                                <span className="text-xs font-medium text-red-500">
                                    {errors.price}
                                </span>
                            )}
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                Category
                            </span>
                            <select
                                value={form.categorySlug}
                                onChange={update("categorySlug")}
                                className={`${inputClass} cursor-pointer`}
                            >
                                {categories.map((category) => (
                                    <option key={category.slug} value={category.slug}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            Description
                        </span>
                        <textarea
                            value={form.description}
                            onChange={update("description")}
                            rows={3}
                            placeholder="Short, mouth-watering description…"
                            className={`${inputClass} resize-none`}
                        />
                    </label>

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-primary/60 px-4 py-3.5">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-secondary">
                                Customizable badge
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Controls whether “Customizable” shows on the storefront card.{" "}
                                {form.isCustomizable ? "Currently shown." : "Currently hidden."}
                            </span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isCustomizable}
                            aria-label="Toggle customizable badge"
                            onClick={() =>
                                setForm((prev) => ({
                                    ...prev,
                                    isCustomizable: !prev.isCustomizable,
                                }))
                            }
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                                form.isCustomizable ? "bg-brand" : "bg-muted"
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                                    form.isCustomizable ? "left-[22px]" : "left-0.5"
                                }`}
                            />
                        </button>
                    </div>

                    {categoryName && form.name && (
                        <p className="text-xs text-muted-foreground">
                            Saving as “<span className="font-semibold text-secondary">{form.name}</span>
                            ” in <span className="font-semibold text-brand">{categoryName}</span>.
                        </p>
                    )}
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
                        {initialValues ? "Save changes" : "Add product"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ProductModal;