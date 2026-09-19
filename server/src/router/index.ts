import { Router } from "express";
import ProductRoutes from "../modules/product/product.routes.js";

const router = Router();

router.use("/products", ProductRoutes);

export default router;