import { Router } from "express";
import { FavoritesController } from "./favorites.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = FavoritesController();

// Every route is account-scoped: an anonymous visitor's favourites live in
// localStorage until they sign in, at which point POST /merge hands them over.

// ROUTE ORDER IS LOAD-BEARING. "/merge" is a single literal segment, and under
// Express 5 it shares its shape with "/:productId", so the literal has to be
// registered first or it would be read as a product id.
router.get("/", requireAuth, controller.getFavorites); // the account's favorites {auth}
router.post("/merge", requireAuth, controller.mergeFavorites); // absorb guest-localStorage favorites on login {auth}
router.post("/:productId", requireAuth, controller.addFavorite); // favorite a product (idempotent) {auth}
router.delete("/:productId", requireAuth, controller.removeFavorite); // unfavorite a product (idempotent) {auth}
router.delete("/", requireAuth, controller.clearFavorites); // unfavorite everything {auth}

export default router;
