import { Router } from "express";
import { CouponController } from "./coupon.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = Router();
const controller = CouponController();

// The admin CRUD set. Reading and validating a coupon is something any signed-in
// customer does at checkout, but creating and spending an offer is not.
router.get("/", requireAuth, requireRole("admin"), controller.getCoupons);
router.post("/", requireAuth, requireRole("admin"), controller.createCoupon);
router.put("/:id", requireAuth, requireRole("admin"), controller.updateCoupon);
router.delete("/:id", requireAuth, requireRole("admin"), controller.deleteCoupon);

router.post("/validate", requireAuth, controller.validateCoupon);

export { router as couponRouter };
