import { api, unwrap } from "../../../../lib/api";

export interface FavoritesView {
    productIDs: number[];
}

/**
 * Every endpoint answers with the caller's full list rather than a boolean, so
 * the caller adopts the server's view verbatim instead of guessing which id
 * landed. Mutating favourites is therefore idempotent by construction.
 */
export const favoritesService = {
    get(): Promise<FavoritesView> {
        return unwrap<FavoritesView>(api.get("/favorites"));
    },

    add(productID: number): Promise<FavoritesView> {
        return unwrap<FavoritesView>(api.post(`/favorites/${productID}`));
    },

    remove(productID: number): Promise<FavoritesView> {
        return unwrap<FavoritesView>(api.delete(`/favorites/${productID}`));
    },

    clear(): Promise<FavoritesView> {
        return unwrap<FavoritesView>(api.delete("/favorites"));
    },

    /**
     * Hands a guest's localStorage list over to the account. Ids the server no
     * longer recognises are dropped by it rather than failing the whole batch.
     */
    merge(productIDs: number[]): Promise<FavoritesView> {
        return unwrap<FavoritesView>(api.post("/favorites/merge", { productIDs }));
    },
};
