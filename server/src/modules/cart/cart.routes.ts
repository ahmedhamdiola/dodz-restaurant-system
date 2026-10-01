import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { optionalAuth, requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = CartController();

// An identity is either the authenticated user (JWT) or an anonymous guest
// (X-Guest-Token header). Routes that mutate require one; GET /cart works for
// everyone and returns an empty cart when no identity is present.
router.get("/", optionalAuth, controller.getCart); // current cart (user or guest) {storefront/auth}
router.post("/items", optionalAuth, controller.addItem); // add/increment a line (optionValueIDs optional) {storefront/auth}
router.put("/items/:cartItemId", optionalAuth, controller.setItemQuantity); // set an exact quantity {storefront/auth}
router.delete("/items/:cartItemId", optionalAuth, controller.removeItem); // remove a line (idempotent) {storefront/auth}
router.delete("/", optionalAuth, controller.clearCart); // empty the cart {storefront/auth}
router.post("/merge", requireAuth, controller.mergeGuestCart); // absorb a guest cart into the account {auth}
router.post("/checkout", optionalAuth, controller.checkout); // place the order, then clear the cart {storefront/auth}

export default router;