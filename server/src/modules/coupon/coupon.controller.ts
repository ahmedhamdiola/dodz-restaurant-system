import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { BadRequestStatus, ConflictStatus, NotFoundStatus, SuccessStatus, UnauthorizedStatus } from "../../utils/response.js";
import { CouponRepository } from "./coupon.repository.js";
import { CouponService } from "./coupon.service.js";
import { CouponError } from "./coupon.types.js";

const repo = CouponRepository();
const service = CouponService(repo);

export const CouponController = () => {
    const getCoupons = async (_req: Request, res: Response) => {
        const user = (req: AuthRequest) => (res.locals as any).user;
        // admin only via middleware usually; but just in case
        const u = (res.locals as any).user;
        if (!u || u.role !== "Admin") {
            return UnauthorizedStatus(res, "Only admins can manage coupons");
        }
        const list = await repo.getAllCoupons();
        return SuccessStatus(res, list);
    };

    const validateCoupon = async (req: Request, res: Response) => {
        const { code, subtotal = 0, deliveryFee = 0 } = req.body ?? {};
        if (!code || typeof code !== "string") {
            return BadRequestStatus(res, "Coupon code is required");
        }
        try {
            const result = await service.applyCoupon({
                couponCode: code,
                subtotal: Number(subtotal),
                deliveryFee: Number(deliveryFee),
            });
            return SuccessStatus(res, result);
        } catch (err) {
            if (err instanceof CouponError) {
                if (err.code === "INVALID_COUPON") return NotFoundStatus(res, err.message);
                if (err.code === "COUPON_EXPIRED" || err.code === "MINIMUM_NOT_MET" || err.code === "COUPON_MAX_USES_REACHED" || err.code === "COUPON_INACTIVE") {
                    return ConflictStatus(res, err.message);
                }
            }
            throw err;
        }
    };

    return { getCoupons, validateCoupon };
};
