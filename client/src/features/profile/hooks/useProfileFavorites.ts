import { useMemo } from "react";
import { useProducts } from "../../menu/hooks/useMenu";
import { useFavorites } from "../../products/favorites/useFavorites";
import type { FavoriteProduct } from "../types";

/**
 * Joins the favorite product ids (localStorage) with the live menu catalog,
 * dropping any ids that no longer resolve to a product. The returned list
 * preserves the order in which the user favorited the items.
 */
export const useProfileFavorites = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const { data: products } = useProducts();

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
                    price: product.price,
                    image: product.image,
                });
            }
        }
        return result;
    }, [favorites, productById]);

    const removeFavorite = (id: number): void => toggleFavorite(id);

    return { favoriteProducts, removeFavorite };
};