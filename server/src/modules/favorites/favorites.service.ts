import { FavoritesRepository } from "./favorites.repository.js";
import { FavoritesView } from "./favorites.types.js";

export const FavoritesService = () => {
    const repository = FavoritesRepository();

    const view = async (userId: number): Promise<FavoritesView> => ({
        productIDs: await repository.listProductIDs(userId),
    });

    const getFavorites = async (userId: number): Promise<FavoritesView> => {
        return view(userId);
    };

    /**
     * `null` means "no such product a customer can favourite". The controller
     * turns that into a 404; the add itself is idempotent so a duplicate tap on
     * a slow connection is harmless.
     */
    const addFavorite = async (userId: number, productID: number): Promise<FavoritesView | null> => {
        if (!Number.isInteger(productID) || productID <= 0) {
            return null;
        }

        const product = await repository.findOrderableProduct(productID);
        if (!product) {
            return null;
        }

        await repository.insertFavorite(userId, productID);
        return view(userId);
    };

    /**
     * Always succeeds. Removing an absent favourite leaves the caller in exactly
     * the state it asked for, so there is nothing to report as a failure.
     */
    const removeFavorite = async (userId: number, productID: number): Promise<FavoritesView> => {
        if (!Number.isInteger(productID) || productID <= 0) {
            return view(userId);
        }

        await repository.deleteFavorite(userId, productID);
        return view(userId);
    };

    /**
     * Empties the list. One statement rather than a delete per id: a customer
     * with 60 favourites should not cost 60 round trips to reset.
     */
    const clearFavorites = async (userId: number): Promise<FavoritesView> => {
        await repository.clearFavorites(userId);
        return view(userId);
    };

    /**
     * Absorbs a guest's localStorage list into the account. This mirrors
     * POST /cart/merge: the browser hands over whatever it saved before the user
     * had an id, and the union of the two sets wins.
     *
     * The ids arrive already validated and deduplicated by the controller, which
     * is the only caller and the only place a malformed body can be reported.
     */
    const mergeFavorites = async (userId: number, productIDs: number[]): Promise<FavoritesView> => {
        if (productIDs.length === 0) {
            return view(userId);
        }

        await repository.mergeFavorites(userId, productIDs);
        return view(userId);
    };

    return {
        getFavorites,
        addFavorite,
        removeFavorite,
        clearFavorites,
        mergeFavorites,
    };
};
