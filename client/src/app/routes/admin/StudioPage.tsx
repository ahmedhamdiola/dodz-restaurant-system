import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { MenuCategory, MenuProduct } from "../../../features/menu/types";
import { menuKeys } from "../../../features/menu/queryKeys";
import { useStudioMenu } from "../../../features/admin/hooks/useStudioMenu";
import CategoryModal, { type CategoryFormValues } from "../../../features/admin/components/studio/CategoryModal";
import ProductModal, { type ProductFormValues } from "../../../features/admin/components/studio/ProductModal";
import StudioCategoryList from "../../../features/admin/components/studio/StudioCategoryList";
import StudioProductCard from "../../../features/admin/components/studio/StudioProductCard";
import { studioApi } from "../../../features/admin/services/studioApi";

const StudioPage = () => {
    const queryClient = useQueryClient();
    const { categories, products, categoryBySlug, productCountsByCategory } = useStudioMenu();

    const [searchParams, setSearchParams] = useSearchParams();
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [apiError, setApiError] = useState("");

    const activeSlug = searchParams.get("category");
    const activeCategory =
        categories.find((category) => category.slug === activeSlug) ?? categories[0];

    const selectCategory = (slug: string) => {
        setSearchParams({ category: slug }, { replace: true });
    };

    const visibleProducts = useMemo(
        () => products.filter((product) => product.categorySlug === activeCategory?.slug),
        [products, activeCategory]
    );

    const refreshMenu = () => {
        queryClient.invalidateQueries({ queryKey: menuKeys.categories });
        queryClient.invalidateQueries({ queryKey: menuKeys.products });
    };

    const openAddProduct = () => {
        setApiError("");
        setEditingProduct(null);
        setProductModalOpen(true);
    };

    const openEditProduct = (product: MenuProduct) => {
        setApiError("");
        setEditingProduct(product);
        setProductModalOpen(true);
    };

    const openAddCategory = () => {
        setApiError("");
        setEditingCategory(null);
        setCategoryModalOpen(true);
    };

    const openEditCategory = (category: MenuCategory) => {
        setApiError("");
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };

    const handleSaveProduct = async (values: ProductFormValues, id?: number) => {
        setApiError("");
        const categoryID = categoryBySlug.get(values.categorySlug)?.id;
        if (!categoryID) {
            return;
        }

        const payload = {
            name: values.name,
            description: values.description,
            price: Number(values.price),
            image: values.image,
            categoryID,
            isAvailable: true,
            isCustomizable: values.isCustomizable,
        };

        try {
            if (id) {
                await studioApi.updateProduct(id, payload);
            } else {
                await studioApi.createProduct(payload);
            }
            setProductModalOpen(false);
            refreshMenu();
        } catch {
            setApiError("Could not save the product. Try again.");
        }
    };

    const handleSaveCategory = async (values: CategoryFormValues, id?: number) => {
        setApiError("");
        const payload = { name: values.name, slug: values.slug, image: values.image };
        try {
            if (id) {
                await studioApi.updateCategory(id, payload);
            } else {
                const created = await studioApi.createCategory(payload);
                selectCategory(created.slug);
            }
            setCategoryModalOpen(false);
            refreshMenu();
        } catch {
            setApiError("Could not save the category. Try again.");
        }
    };

    const handleDeleteCategory = async (category: MenuCategory) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) {
            return;
        }
        try {
            await studioApi.deleteCategory(category.id);
            setSearchParams((current) => {
                if (current.get("category") === category.slug) {
                    const next = new URLSearchParams(current);
                    next.delete("category");
                    return next;
                }
                return current;
            });
            refreshMenu();
        } catch {
            setApiError("Could not delete the category. Try again.");
        }
    };

    if (!activeCategory) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">No categories yet.</p>
                <button
                    type="button"
                    onClick={openAddCategory}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Category
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row">
                <StudioCategoryList
                    categories={categories}
                    productCounts={productCountsByCategory}
                    activeSlug={activeCategory.slug}
                    onSelect={selectCategory}
                    onAdd={openAddCategory}
                    onEdit={openEditCategory}
                    onDelete={handleDeleteCategory}
                />

                <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold uppercase tracking-tight text-secondary">
                                {activeCategory.name}
                            </h2>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                {visibleProducts.length} product
                                {visibleProducts.length !== 1 && "s"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={openAddProduct}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Product
                        </button>
                    </div>

                    {visibleProducts.length > 0 ? (
                        <div className="scrollbar-x flex gap-4 overflow-x-auto px-1 pb-4">
                            {visibleProducts.map((product) => (
                                <div key={product.id} className="w-[280px] shrink-0 sm:w-[300px]">
                                    <StudioProductCard
                                        product={product}
                                        onEdit={openEditProduct}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <ShoppingBagIcon className="h-6 w-6" />
                            </span>
                            <p className="text-sm text-muted-foreground">
                                This category is empty. Use the Add Product button to stock it up.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {categoryModalOpen && (
                <CategoryModal
                    initialValues={editingCategory}
                    error={apiError}
                    onClose={() => setCategoryModalOpen(false)}
                    onSave={handleSaveCategory}
                />
            )}

            {productModalOpen && (
                <ProductModal
                    categories={categories}
                    initialValues={editingProduct}
                    defaultCategorySlug={activeCategory.slug}
                    error={apiError}
                    onClose={() => setProductModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default StudioPage;