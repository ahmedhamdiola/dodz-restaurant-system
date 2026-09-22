import { api, unwrap } from "../../../lib/api";
import type { MenuCategory, MenuProduct } from "../types";

interface CategoryDTO {
    id: number;
    slug: string;
    name: string;
    cover_image: string;
}

interface ProductDTO {
    id: number;
    category_slug: string;
    name: string;
    description: string;
    price: number;
    image: string;
    is_available: boolean;
    is_customizable: boolean;
}

export const menuService = {
    getCategories(): Promise<MenuCategory[]> {
        return unwrap<CategoryDTO[]>(api.get("/categories")).then((categories) =>
            categories.map((category) => ({
                id: category.id,
                slug: category.slug,
                name: category.name,
                image: category.cover_image,
            }))
        );
    },
    getProducts(): Promise<MenuProduct[]> {
        return unwrap<ProductDTO[]>(api.get("/products")).then((products) =>
            products.map((product) => ({
                id: product.id,
                categorySlug: product.category_slug,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                isCustomizable: product.is_customizable,
            }))
        );
    },
    getProductById(id: number): Promise<MenuProduct> {
        return unwrap<ProductDTO>(api.get(`/products/${id}`)).then((product) => ({
            id: product.id,
            categorySlug: product.category_slug,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            isCustomizable: product.is_customizable,
        }));
    },
    getTopDeals(): Promise<MenuProduct[]> {
        return unwrap<ProductDTO[]>(api.get("/products/top-deals")).then((products) =>
            products.map((product) => ({
                id: product.id,
                categorySlug: product.category_slug,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                isCustomizable: product.is_customizable,
            }))
        );
    },
};