import { useMemo, useState } from "react";
import { PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { MENU_CATEGORIES, MENU_PRODUCTS } from "../../../features/menu/data";
import type { MenuCategory, MenuProduct } from "../../../features/menu/types";
import CategoryModal, { type CategoryFormValues } from "../../../features/admin/components/studio/CategoryModal";
import ProductModal, { type ProductFormValues } from "../../../features/admin/components/studio/ProductModal";
import StudioCategoryList from "../../../features/admin/components/studio/StudioCategoryList";
import StudioProductCard from "../../../features/admin/components/studio/StudioProductCard";

const StudioPage = () => {
    const [categories, setCategories] = useState<MenuCategory[]>(MENU_CATEGORIES);
    const [products, setProducts] = useState<MenuProduct[]>(
        MENU_PRODUCTS.map((product) => ({ ...product, isCustomizable: true }))
    );
    const [activeSlug, setActiveSlug] = useState(MENU_CATEGORIES[0].slug);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);

    const activeCategory =
        categories.find((category) => category.slug === activeSlug) ?? categories[0];

    const visibleProducts = useMemo(
        () => products.filter((product) => product.categorySlug === activeSlug),
        [products, activeSlug]
    );

    const productCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const product of products) {
            counts[product.categorySlug] = (counts[product.categorySlug] ?? 0) + 1;
        }
        return counts;
    }, [products]);

    const nextProductId = Math.max(...products.map((product) => product.id), 0) + 1;
    const nextCategoryId = Math.max(...categories.map((category) => category.id), 0) + 1;

    const openAddProduct = () => {
        setEditingProduct(null);
        setProductModalOpen(true);
    };

    const openEditProduct = (product: MenuProduct) => {
        setEditingProduct(product);
        setProductModalOpen(true);
    };

    const handleSaveProduct = (values: ProductFormValues, id?: number) => {
        const price = Number(values.price);
        if (id) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === id
                        ? {
                              ...product,
                              name: values.name,
                              description: values.description,
                              price,
                              image: values.image,
                              categorySlug: values.categorySlug,
                              isCustomizable: values.isCustomizable,
                          }
                        : product
                )
            );
        } else {
            setProducts((prev) => [
                ...prev,
                {
                    id: nextProductId,
                    name: values.name,
                    description: values.description,
                    price,
                    image: values.image,
                    categorySlug: values.categorySlug,
                    isCustomizable: values.isCustomizable,
                },
            ]);
        }
        setProductModalOpen(false);
    };

    const handleSaveCategory = (values: CategoryFormValues) => {
        setCategories((prev) => [
            ...prev,
            { id: nextCategoryId, name: values.name, slug: values.slug, image: values.image },
        ]);
        setActiveSlug(values.slug);
        setCategoryModalOpen(false);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row">
                <StudioCategoryList
                    categories={categories}
                    productCounts={productCounts}
                    activeSlug={activeSlug}
                    onSelect={setActiveSlug}
                    onAdd={() => setCategoryModalOpen(true)}
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {visibleProducts.map((product) => (
                                <StudioProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={openEditProduct}
                                />
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
                    onClose={() => setCategoryModalOpen(false)}
                    onSave={handleSaveCategory}
                />
            )}

            {productModalOpen && (
                <ProductModal
                    categories={categories}
                    initialValues={editingProduct}
                    defaultCategorySlug={activeSlug}
                    onClose={() => setProductModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default StudioPage;