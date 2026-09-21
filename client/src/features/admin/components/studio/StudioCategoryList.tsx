import { PlusIcon } from "@heroicons/react/24/outline";
import type { MenuCategory } from "../../../menu/types";

interface StudioCategoryListProps {
    categories: MenuCategory[];
    productCounts: Record<string, number>;
    activeSlug: string;
    onSelect: (slug: string) => void;
    onAdd: () => void;
}

interface CategoryItemProps {
    category: MenuCategory;
    count: number;
    active: boolean;
    onSelect: (slug: string) => void;
    horizontal?: boolean;
}

const CategoryItem = ({ category, count, active, onSelect, horizontal }: CategoryItemProps) => (
    <button
        type="button"
        onClick={() => onSelect(category.slug)}
        className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
            active
                ? "bg-brand text-white shadow-md shadow-red-900/20"
                : "text-muted-foreground hover:bg-muted hover:text-secondary"
        } ${horizontal ? "w-fit" : "w-full"}`}
    >
        <span
            className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-white" : "bg-brand/60"}`}
        />
        <span className="truncate">{category.name}</span>
        <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}
        >
            {count}
        </span>
    </button>
);

const StudioCategoryList = ({
    categories,
    productCounts,
    activeSlug,
    onSelect,
    onAdd,
}: StudioCategoryListProps) => {
    const items = categories.map((category) => (
        <CategoryItem
            key={category.slug}
            category={category}
            count={productCounts[category.slug] ?? 0}
            active={category.slug === activeSlug}
            onSelect={onSelect}
        />
    ));

    return (
        <>
            <div className="scrollbar-x flex gap-2 overflow-x-auto pb-2 lg:hidden">
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