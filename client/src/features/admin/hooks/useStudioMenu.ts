import { useMemo } from "react";
import { useCategories, useProducts } from "../../menu/hooks/useMenu";
import type { MenuCategory, MenuProduct } from "../../menu/types";

interface StudioMenu {
    categories: MenuCategory[];
    products: MenuProduct[];
    categoryBySlug: Map<string, MenuCategory>;
    productCountsByCategory: Record<string, number>;
    isLoading: boolean;
    isError: boolean;
}

export const useStudioMenu = (): StudioMenu => {
    const categoriesQuery = useCategories();
    const productsQuery = useProducts();

    const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
    const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

    const categoryBySlug = useMemo(
        () => new Map(categories.map((category) => [category.slug, category])),
        [categories]
    );

    const productCountsByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const product of products) {
            counts[product.categorySlug] = (counts[product.categorySlug] ?? 0) + 1;
        }
        return counts;
    }, [products]);

    return {
        categories,
        products,
        categoryBySlug,
        productCountsByCategory,
        isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        isError: categoriesQuery.isError || productsQuery.isError,
    };
};