import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MENU_CATEGORIES, MENU_PRODUCTS } from "../data";
import { menuService } from "../services/menuService";
import { menuKeys } from "../queryKeys";
import type { MenuCategory, MenuProduct } from "../types";

const MENU_STALE_TIME = 5 * 60_000;
const TOP_DEALS_PLACEHOLDER = MENU_PRODUCTS.slice(0, 3);

const toCategoryMap = (categories: MenuCategory[]) =>
    new Map(categories.map((category) => [category.slug, category]));

const toProductsMap = (products: MenuProduct[]) => {
    const map = new Map<string, MenuProduct[]>();
    for (const product of products) {
        const list = map.get(product.categorySlug);
        if (list) {
            list.push(product);
        } else {
            map.set(product.categorySlug, [product]);
        }
    }
    return map;
};

export const useCategories = () => {
    return useQuery({
        queryKey: menuKeys.categories,
        queryFn: menuService.getCategories,
        placeholderData: MENU_CATEGORIES,
        staleTime: MENU_STALE_TIME,
    });
};

export const useProducts = () => {
    return useQuery({
        queryKey: menuKeys.products,
        queryFn: menuService.getProducts,
        placeholderData: MENU_PRODUCTS,
        staleTime: MENU_STALE_TIME,
    });
};

export const useProduct = (id: number) => {
    return useQuery({
        queryKey: menuKeys.product(id),
        queryFn: () => menuService.getProductById(id),
        enabled: Number.isInteger(id) && id > 0,
        staleTime: MENU_STALE_TIME,
    });
};

export const useTopDeals = () => {
    return useQuery({
        queryKey: menuKeys.topDeals,
        queryFn: menuService.getTopDeals,
        placeholderData: TOP_DEALS_PLACEHOLDER,
        staleTime: MENU_STALE_TIME,
    });
};

export const useMenu = () => {
    const categoriesQuery = useCategories();
    const productsQuery = useProducts();

    const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
    const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

    const categoryBySlug = useMemo(() => toCategoryMap(categories), [categories]);
    const productsByCategory = useMemo(() => toProductsMap(products), [products]);
    const productsByID = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products]
    );

    return {
        categories,
        products,
        categoryBySlug,
        productsByCategory,
        productsByID,
        isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        isError: categoriesQuery.isError || productsQuery.isError,
    };
};