import { api, unwrap } from "../../../lib/api";
import type { AdminProduct } from "../types";

interface ProductDTO {
    id: number;
    category_id: number;
    category_name: string;
    category_slug: string;
    name: string;
    description: string;
    price: number;
    image: string;
    is_available: boolean;
    is_customizable: boolean;
    sold_amount: number;
}

const mapProduct = (product: ProductDTO): AdminProduct => ({
    id: product.id,
    name: product.name,
    category: product.category_name,
    price: product.price,
    sold: product.sold_amount,
    isAvailable: product.is_available,
    status: product.is_available ? "Active" : "Out of stock",
});

export const productsApi = {
    getAdminProducts(): Promise<AdminProduct[]> {
        return unwrap<ProductDTO[]>(
            api.get("/products", { params: { includeUnavailable: true } })
        ).then((products) => products.map(mapProduct));
    },
};