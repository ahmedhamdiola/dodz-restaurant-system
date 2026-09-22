import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { MenuCategory } from "../../../menu/types";

interface StudioCategoryListProps {
    categories: MenuCategory[];
    productCounts: Record<string, number>;
    activeSlug: string;
    onSelect: (slug: string) => void;
    onAdd: () => void;
    onEdit: (category: MenuCategory) => void;
    onDelete: (category: MenuCategory) => void;
}

interface CategoryItemProps {
    category: MenuCategory;
    count: number;
    active: boolean;
    onSelect: (slug: string) => void;
    onEdit: (category: MenuCategory) => void;
    onDelete: (category: MenuCategory) => void;
}

const CategoryItem = ({
    category,
    count,
    active,
    onSelect,
    onEdit,
    onDelete,
}: CategoryItemProps) => {
    const activeClasses = "bg-brand text-white shadow-md shadow-red-900/20";
    const idleClasses = "text-muted-foreground hover:bg-muted hover:text-secondary";
    const actionActiveClasses = "text-white/80 hover:text-white";
    const actionIdleClasses = "text-muted-foreground hover:text-secondary";

    return (
        <div
            className={`flex w-full shrink-0 items-center overflow-hidden rounded-lg transition-colors duration-200 ${
                active ? activeClasses : idleClasses
            }`}
        >
            <button
                type="button"
                onClick={() => onSelect(category.slug)}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium"
            >
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                        active ? "bg-white" : "bg-brand/60"
                    }`}
                />
                <span className="truncate">{category.name}</span>
                <span
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                >
                    {count}
                </span>
            </button>
            <div className={`flex shrink-0 items-center ${active ? actionActiveClasses : actionIdleClasses}`}>
                <button
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    title="Edit category"
                    onClick={() => onEdit(category)}
                    className="rounded-md p-1.5 transition-colors hover:bg-black/10"
                >
                    <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    title="Delete category"
                    onClick={() => onDelete(category)}
                    className="rounded-md p-1.5 pr-2.5 transition-colors hover:bg-black/10"
                >
                    <TrashIcon className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

const StudioCategoryList = ({
    categories,
    productCounts,
    activeSlug,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
}: StudioCategoryListProps) => {
    const items = categories.map((category) => (
        <CategoryItem
            key={category.slug}
            category={category}
            count={productCounts[category.slug] ?? 0}
            active={category.slug === activeSlug}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    ));

    return (
        <>
            <div className="scrollbar-x flex items-start gap-2 overflow-x-auto pb-2 lg:hidden">
                {items}
                <button
                    type="button"
                    onClick={onAdd}
                    aria-label="Add category"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-border px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add
                </button>
            </div>

            <nav className="hidden w-64 shrink-0 flex-col items-start gap-1 lg:flex">
                <p className="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Categories
                </p>
                {items}
                <button
                    type="button"
                    onClick={onAdd}
                    aria-label="Add category"
                    title="Add category"
                    className="ml-3.5 mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand"
                >
                    <PlusIcon className="h-4 w-4" />
                </button>
            </nav>
        </>
    );
};

export default StudioCategoryList;