import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "../../../../components/navbar/hooks/useScrollLock";
import { useEscapeKey } from "../../../../components/sidebar/hooks/useEscapeKey";
import { useFocusTrap } from "../../../cart/hooks/useFocusTrap";
import { useReplaceOptionsMutation } from "../../../products/customize/redux/customizeApi";
import { useAdminProductOptions } from "../../hooks/useProductOptionsAdmin";
import type { MenuCategory, MenuProduct } from "../../../menu/types";
import ImageUploader from "./ImageUploader";
import OptionGroupsBuilder from "./OptionGroupsBuilder";
import {
    serializeGroups,
    snapshotGroups,
    toGroupDraft,
    validateGroups,
    type OptionGroupDraft,
} from "./optionDraft";

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

/** `unwrap` rejects with the raw AxiosError, so the backend `message` is reachable. */
const serverMessage = (error: unknown, fallback: string) => {
    const payload = error as { response?: { data?: { message?: string } } } | null;
    const message = payload?.response?.data?.message;
    return typeof message === "string" && message.trim() !== "" ? message : fallback;
};

interface ProductModalProps {
    categories: MenuCategory[];
    initialValues?: MenuProduct | null;
    defaultCategorySlug: string;
    error?: string;
    onClose: () => void;
    /**
     * Persists the product itself and resolves with the saved record so the modal
     * can attach the option tree to the resulting id. Resolving `null` (or
     * rejecting) means the product step failed and the modal stays open.
     */
    onSave: (values: ProductFormValues, id?: number) => Promise<MenuProduct | null>;
}

const ProductModal = ({
    categories,
    initialValues = null,
    defaultCategorySlug,
    error,
    onClose,
    onSave,
}: ProductModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);

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
    const [optionGroups, setOptionGroups] = useState<OptionGroupDraft[]>([]);
    const [optionsError, setOptionsError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    /**
     * Set the moment a brand-new product is created. A retry then updates that
     * product instead of creating a duplicate before the options are attached.
     */
    const [attachedProductID, setAttachedProductID] = useState<number | null>(null);

    const productID = initialValues?.id ?? attachedProductID;
    const optionsQuery = useAdminProductOptions(productID);
    const [replaceOptions] = useReplaceOptionsMutation();

    const formSignature = JSON.stringify(form);
    const optionsSignature = snapshotGroups(optionGroups);

    // Seed the draft + dirty-check baseline from the server exactly once per
    // product. `srv-<id>` only flips on a genuine (re)load, so a background
    // refetch can never clobber edits the admin is in the middle of making.
    const seedStamp = optionsQuery.isSuccess
        ? `srv-${productID}`
        : productID === null
          ? "new"
          : "loading";
    const [seededFor, setSeededFor] = useState<string | null>(null);
    const [baseline, setBaseline] = useState<{ form: string; options: string } | null>(null);
    if (seedStamp !== "loading" && seededFor !== seedStamp) {
        setSeededFor(seedStamp);
        const drafts = optionsQuery.isSuccess ? (optionsQuery.data ?? []).map(toGroupDraft) : [];
        setOptionGroups(drafts);
        setBaseline({ form: formSignature, options: snapshotGroups(drafts) });
    }

    const isDirty =
        baseline !== null &&
        (formSignature !== baseline.form || optionsSignature !== baseline.options);

    const update =
        (key: keyof ProductFormValues) =>
        (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
            if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
        };

    // Turning customizability off deletes the whole tree, so a tree that is
    // about to be discarded must never block the save.
    const optionIssues = useMemo(
        () => (form.isCustomizable ? validateGroups(optionGroups) : []),
        [form.isCustomizable, optionGroups]
    );
    const optionsPayload = form.isCustomizable ? serializeGroups(optionGroups) : [];
    const canSubmit = !isSaving && optionIssues.length === 0;

    const categoryName =
        categories.find((category) => category.slug === form.categorySlug)?.name ?? "";

    const requestClose = useCallback(() => {
        if (isSaving) return;
        if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) {
            return;
        }
        onClose();
    }, [isDirty, isSaving, onClose]);

    useScrollLock(true);
    useEscapeKey(true, requestClose);
    useFocusTrap(dialogRef, true);

    const handleSubmit = async () => {
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
        if (optionIssues.length > 0) {
            setOptionsError("Fix the option group issues listed above before saving.");
            return;
        }

        setIsSaving(true);
        setOptionsError("");
        try {
            const saved = await onSave(
                {
                    ...form,
                    name: form.name.trim(),
                    image: form.image.trim(),
                },
                initialValues?.id ?? attachedProductID ?? undefined
            );
            if (!saved) {
                setIsSaving(false);
                return;
            }
            // A brand-new product only has an id after this point, so the option
            // tree is attached immediately, in the same save.
            setAttachedProductID(saved.id);
            setSeededFor(`srv-${saved.id}`);
            // The response seeds the admin's option cache and invalidates the
            // storefront's copy of the same tree via its shared tag.
            await replaceOptions({
                productID: saved.id,
                payload: { options: optionsPayload },
            }).unwrap();
            onClose();
        } catch (failure) {
            setOptionsError(
                serverMessage(
                    failure,
                    "The product was saved but its options could not be. Fix the tree and hit save again."
                )
            );
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={requestClose}
                aria-hidden="true"
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={initialValues ? `Edit ${initialValues.name}` : "Add a new product"}
                tabIndex={-1}
                className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl ${
                    form.isCustomizable ? "sm:max-w-3xl" : "sm:max-w-xl"
                }`}
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
                        onClick={requestClose}
                        disabled={isSaving}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
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

                    <ImageUploader
                        label="Image"
                        value={form.image}
                        onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                    />

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
                                Customizable meal
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {form.isCustomizable
                                    ? "Customers open a “Customize Your Meal” screen before adding."
                                    : optionGroups.length > 0
                                      ? "Added straight to the cart. Saving will delete the option groups below."
                                      : "Added straight to the cart, no customization screen."}
                            </span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isCustomizable}
                            aria-label="Toggle customizable meal"
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

                    {form.isCustomizable && (
                        <div className="flex flex-col gap-3 border-t border-border pt-4">
                            <OptionGroupsBuilder
                                groups={optionGroups}
                                onChange={setOptionGroups}
                                disabled={isSaving}
                            />
                            {optionsQuery.isError && (
                                <p className="text-xs font-medium text-red-500">
                                    Couldn't load the existing options for this product.
                                </p>
                            )}
                            {optionIssues.length > 0 && (
                                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5">
                                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-500">
                                        <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                                        Fix before saving
                                    </p>
                                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-red-500">
                                        {optionIssues.map((issue) => (
                                            <li key={issue}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {categoryName && form.name && (
                        <p className="text-xs text-muted-foreground">
                            Saving as “<span className="font-semibold text-secondary">{form.name}</span>
                            ” in <span className="font-semibold text-brand">{categoryName}</span>.
                        </p>
                    )}

                    {error && (
                        <span className="text-xs font-medium text-red-500">{error}</span>
                    )}

                    {optionsError && (
                        <p role="alert" className="text-xs font-medium text-red-500">
                            {optionsError}
                        </p>
                    )}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
                    <span className="text-[11px] text-muted-foreground">
                        {isDirty ? "Unsaved changes" : "All changes saved"}
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={requestClose}
                            disabled={isSaving}
                            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleSubmit()}
                            disabled={!canSubmit}
                            className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving
                                ? "Saving…"
                                : productID !== null
                                  ? "Save changes"
                                  : "Add product"}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ProductModal;
