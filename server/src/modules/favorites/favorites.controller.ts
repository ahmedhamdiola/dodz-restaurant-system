import type { Request, Response } from "express";
import { FavoritesService } from "./favorites.service.js";
import { MAX_FAVORITES } from "./favorites.types.js";
import { AuthRequest } from "../auth/auth.middleware.js";
import {
    BadRequestStatus,
    CheckId,
    NotFoundStatus,
    SuccessStatus,
} from "../../utils/response.js";

const service = FavoritesService();

/** The verified JWT subject. requireAuth has already rejected anyone without one. */
const currentUserID = (req: Request): number => (req as AuthRequest).user!.id;

export const FavoritesController = () => {
    const getFavorites = async (req: Request, res: Response) => {
        return SuccessStatus(res, await service.getFavorites(currentUserID(req)));
    };

    const addFavorite = async (req: Request, res: Response) => {
        const productID = Number(req.params.productId);
        if (!CheckId(productID)) {
            return BadRequestStatus(res, "Invalid product id");
        }

        const favorites = await service.addFavorite(currentUserID(req), productID);
        if (favorites === null) {
            return NotFoundStatus(res, "Product not found");
        }

        return SuccessStatus(res, favorites);
    };

    const removeFavorite = async (req: Request, res: Response) => {
        const productID = Number(req.params.productId);
        if (!CheckId(productID)) {
            return BadRequestStatus(res, "Invalid product id");
        }

        return SuccessStatus(res, await service.removeFavorite(currentUserID(req), productID));
    };

    const clearFavorites = async (req: Request, res: Response) => {
        return SuccessStatus(res, await service.clearFavorites(currentUserID(req)));
    };

    /**
     * The body is a browser's localStorage dump, so it is treated as untrusted:
     * a wrong shape or an absurd length is rejected outright, but individual
     * junk entries are dropped rather than fatal, since one bad id should not
     * cost the customer the rest of their favourites.
     */
    const mergeFavorites = async (req: Request, res: Response) => {
        const raw: unknown = req.body?.productIDs;
        if (!Array.isArray(raw)) {
            return BadRequestStatus(res, "productIDs must be an array");
        }
        if (raw.length > MAX_FAVORITES) {
            return BadRequestStatus(res, `At most ${MAX_FAVORITES} favorites can be merged at once`);
        }

        const productIDs = [
            ...new Set(
                raw
                    .map((value) => Number(value))
                    .filter((value) => Number.isInteger(value) && value > 0)
            ),
        ];

        return SuccessStatus(res, await service.mergeFavorites(currentUserID(req), productIDs));
    };

    return {
        getFavorites,
        addFavorite,
        removeFavorite,
        clearFavorites,
        mergeFavorites,
    };
};
