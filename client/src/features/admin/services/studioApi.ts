import { api, unwrap } from "../../../lib/api";
import type { MenuCategory, MenuProduct } from "../../menu/types";

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

export interface CategoryPayload {
    name: string;
    slug: string;
    image: string;
}

export interface ProductPayload {
    name: string;
    description: string;
    price: number;
    image: string;
    categoryID: number;
    isAvailable: boolean;
    isCustomizable: boolean;
}

const mapCategory = (category: CategoryDTO): MenuCategory => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    image: category.cover_image,
});

const mapProduct = (product: ProductDTO): MenuProduct => ({
    id: product.id,
    categorySlug: product.category_slug,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    isCustomizable: product.is_customizable,
});

export const studioApi = {
    createCategory(payload: CategoryPayload): Promise<MenuCategory> {
        return unwrap<CategoryDTO>(api.post("/categories", payload)).then(mapCategory);
    },
    updateCategory(id: number, payload: CategoryPayload): Promise<MenuCategory> {
        return unwrap<CategoryDTO>(api.put(`/categories/${id}`, payload)).then(mapCategory);
    },
    deleteCategory(id: number): Promise<void> {
        return api.delete(`/categories/${id}`);
    },
    createProduct(payload: ProductPayload): Promise<MenuProduct> {
        return unwrap<ProductDTO>(api.post("/products", payload)).then(mapProduct);
    },
    updateProduct(id: number, payload: ProductPayload): Promise<MenuProduct> {
        return unwrap<ProductDTO>(api.put(`/products/${id}`, payload)).then(mapProduct);
    },
    deleteProduct(id: number): Promise<void> {
        return api.delete(`/products/${id}`);
    },
};