import { useMemo } from "react";
import { useProducts } from "../../../menu/hooks/useMenu";
import { useFavorites } from "../useFavorites";
import type { FavoriteProduct } from "../types";

/**
 * Joins the favourited product ids with the live catalogue, dropping ids that no
 * longer resolve to a product (deleted, or an ingredient that was never
 * listable). The order of `favorites` is preserved, so the grid reads in the
 * order the customer built it rather than alphabetically or by popularity.
 */
export const useFavoriteProducts = () => {
    const { favorites, removeFavorite, clearFavorites, isLoading } = useFavorites();
    const { data: products, isLoading: isLoadingCatalog } = useProducts();

    const productById = useMemo(
        () => new Map((products ?? []).map((product) => [product.id, product])),
        [products]
    );

    const favoriteProducts = useMemo<FavoriteProduct[]>(() => {
        const result: FavoriteProduct[] = [];
        for (const id of favorites) {
            const product = productById.get(id);
            if (product) {
                result.push({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    categorySlug: product.categorySlug,
                    // Optional on the catalogue type; a favourites card needs a
                    // definite answer to route through the customizer or not.
                    isCustomizable: product.isCustomizable ?? false,
                });
            }
        }
        return result;
    }, [favorites, productById]);

    return {
        favoriteProducts,
        removeFavorite,
        clearFavorites,
        isLoading: isLoading || isLoadingCatalog === true,
    };
};
