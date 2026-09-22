import { Router } from "express";
import { OrderController } from "./order.controller.js";

const router = Router();
const controller = OrderController();

router.get("/stats", controller.getOrderStats); // dashboard aggregate stats {admin}
router.get("/count", controller.getOrdersCountByBranch); // orders count per branch {admin}
router.get("/:id", controller.getOrderByID); // get order by id {admin}

router.get("/", controller.getAllOrders); // get all orders, filter by branchId/status {admin}

router.post("/", controller.createOrder); // create order {storefront/admin}
router.patch("/:id/status", controller.updateOrderStatus); // update order status {admin}

export default router;