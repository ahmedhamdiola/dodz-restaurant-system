import { Router } from "express";
import { StockController } from "./stock.controller.js";
import { optionalAuth, requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = StockController();

// Branch scoping (main admin = any branch, branch_admin = own branch only) is
// enforced in the service, which reads the caller's branch from the users
// table. Customers and staff are rejected there with a 403.
router.get("/branch/:branchId", requireAuth, controller.getBranchStock); // menu + per-branch counts {admin or branch_admin: own branch}
router.get("/branch/:branchId/available", optionalAuth, controller.getAvailableStock); // per-product availability (public)
router.put("/branch/:branchId/product/:productId", requireAuth, controller.setProductStock); // set quantity / threshold {admin or branch_admin: own branch}

export default router;
