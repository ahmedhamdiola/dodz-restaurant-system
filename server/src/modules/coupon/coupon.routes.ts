import { Router } from "express";
import { CouponController } from "./coupon.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = Router();
const controller = CouponController();

router.get("/", requireAuth, requireRole("admin"), controller.getCoupons);
router.post("/validate", requireAuth, controller.validateCoupon);

export { router as couponRouter };
