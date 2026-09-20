import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import CategoryTabs from "../../features/menu/components/CategoryTabs";
import ProductGrid from "../../features/menu/components/ProductGrid";
import { MENU_CATEGORIES, MENU_PRODUCTS } from "../../features/menu/data";

const MenuPage = () => {
    const { categorySlug } = useParams();
    const activeCategory = useMemo(
        () => MENU_CATEGORIES.find((category) => category.slug === categorySlug),
        [categorySlug]
    );
    const products = useMemo(
        () =>
            activeCategory
                ? MENU_PRODUCTS.filter(
                      (product) => product.categorySlug === activeCategory.slug
                  )
                : MENU_PRODUCTS,
        [activeCategory]
    );

    const pageTitle = activeCategory
        ? `${activeCategory.name} | DODZ Fried Chicken`
        : "Menu | DODZ Fried Chicken";

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta
                    name="description"
                    content={`Explore the DODZ Fried Chicken ${activeCategory ? activeCategory.name.toLowerCase() : "menu"} featuring crispy fried chicken, delicious meals, sides, and more.`}
                />
            </Helmet>
            <div className="bg-primary px-5 py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <header className="flex flex-col items-center gap-2 text-center">
                        <h1 className="border-b-2 border-red-600 pb-1 text-2xl font-bold uppercase tracking-tighter text-secondary sm:text-3xl lg:text-4xl">
                            {activeCategory ? activeCategory.name : "Our Menu"}
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                            {activeCategory
                                ? `Handpicked ${activeCategory.name.toLowerCase()} crafted fresh for every craving.`
                                : "Fresh, crispy, and always cooked to order. Pick a category or browse everything."}
                        </p>
                    </header>

                    <CategoryTabs activeSlug={categorySlug} />

                    {products.length > 0 ? (
                        <ProductGrid products={products} />
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-20 text-center">
                            <h2 className="text-xl font-bold text-secondary">
                                No items found in this category
                            </h2>
                            <Link
                                to="/menu"
                                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                            >
                                Browse the full menu
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MenuPage;