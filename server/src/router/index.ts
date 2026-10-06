import { Router } from "express";
import ProductRoutes from "../modules/product/product.routes.js";
import CategoryRoutes from "../modules/category/category.routes.js";
import ContactRoutes from "../modules/contact/contact.routes.js";
import UserRoutes from "../modules/users/user.routes.js";
import UploadRoutes from "../modules/upload/upload.routes.js";
import BranchRoutes from "../modules/branch/branch.routes.js";
import OrderRoutes from "../modules/order/order.routes.js";
import AuthRoutes from "../modules/auth/auth.routes.js";
import CartRoutes from "../modules/cart/cart.routes.js";
import FavoritesRoutes from "../modules/favorites/favorites.routes.js";

const router = Router();

router.use("/products", ProductRoutes);
router.use("/categories", CategoryRoutes);
router.use("/contact", ContactRoutes);
router.use("/users", UserRoutes);
router.use("/uploads", UploadRoutes);
router.use("/branches", BranchRoutes);
router.use("/orders", OrderRoutes);
router.use("/auth", AuthRoutes);
router.use("/cart", CartRoutes);
router.use("/favorites", FavoritesRoutes);

export default router;