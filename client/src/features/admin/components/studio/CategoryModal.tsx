import { useState, type ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { slugify } from "./utils";

export interface CategoryFormValues {
    name: string;
    image: string;
    slug: string;
}

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const errorInputClass =
    "w-full rounded-lg border border-red-500 bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

interface CategoryModalProps {
    onClose: () => void;
    onSave: (values: CategoryFormValues) => void;
}

const CategoryModal = ({ onClose, onSave }: CategoryModalProps) => {
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [error, setError] = useState("");

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setError("");
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Category name is required");
            return;
        }
        onSave({ name: name.trim(), image: image.trim(), slug: slugify(name) });
    };

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
                aria-label="Add a new category"
                className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                            Add Category
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            A new tab in the product playground.
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

                <div className="flex flex-col gap-4 px-5 py-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            Category Name
                        </span>
                        <input
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Breakfast Combos"
                            autoFocus
                            className={error ? errorInputClass : inputClass}
                        />
                        {error && (
                            <span className="text-xs font-medium text-red-500">{error}</span>
                        )}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                            Image URL <span className="normal-case text-muted-foreground">(optional)</span>
                        </span>
                        <input
                            value={image}
                            onChange={(event) => setImage(event.target.value)}
                            placeholder="https://…"
                            dir="ltr"
                            className={inputClass}
                        />
                    </label>

                    {name.trim() && (
                        <p className="text-xs text-muted-foreground">
                            Slug: <span className="font-mono text-brand">#{slugify(name)}</span>
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
                        Create category
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CategoryModal;