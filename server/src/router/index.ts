import { Router } from "express";
import ProductRoutes from "../modules/product/product.routes.js";
import CategoryRoutes from "../modules/category/category.routes.js";
import ContactRoutes from "../modules/contact/contact.routes.js";
import UserRoutes from "../modules/users/user.routes.js";

const router = Router();

router.use("/products", ProductRoutes);
router.use("/categories", CategoryRoutes);
router.use("/contact", ContactRoutes);
router.use("/users", UserRoutes);

export default router;