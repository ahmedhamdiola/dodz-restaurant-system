import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = Router();
const controller = OrderController();

router.get("/my", requireAuth, controller.getMyOrders); // authenticated user's own orders (matched by their phone)
router.get("/stats", requireAuth, requireRole("admin"), controller.getOrderStats); // dashboard aggregate stats {admin}
router.get("/count", requireAuth, requireRole("admin"), controller.getOrdersCountByBranch); // orders count per branch {admin}
router.get("/:id", requireAuth, requireRole("admin"), controller.getOrderByID); // get order by id {admin}

router.get("/", requireAuth, requireRole("admin"), controller.getAllOrders); // get all orders, filter by branchId/status/customerPhone {admin}

router.post("/", controller.createOrder); // create order {storefront}

router.patch("/:id/status", requireAuth, requireRole("admin"), controller.updateOrderStatus); // update order status {admin}

export default router;