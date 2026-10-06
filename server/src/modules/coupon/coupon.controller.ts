import type { Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { CouponService } from "./coupon.service.js";
import { CouponError } from "./coupon.types.js";
import {
    BadRequestStatus,
    ConflictStatus,
    NotFoundStatus,
    SuccessStatus,
} from "../../utils/response.js";

const repo = CouponRepository();
const service = CouponService(repo);

export const CouponController = () => {
    /** Admin listing. requireRole already rejected non-admins upstream. */
    const getCoupons = async (_req: Request, res: Response) => {
        return SuccessStatus(res, await repo.getAllCoupons());
    };

    /**
     * Checks a code against a quote without consuming it, so the storefront can
     * say "this will save you X" before checkout. It is a quote only: the amount
     * shown here is not authoritative, because subtotal and delivery fee are both
     * still client-supplied. Checkout re-evaluates the same code server-side.
     */
    const validateCoupon = async (req: Request, res: Response) => {
        const code = req.body?.code;
        if (typeof code !== "string" || !code.trim()) {
            return BadRequestStatus(res, "Coupon code is required");
        }

        const subtotal = Number(req.body?.subtotal);
        const deliveryFee = Number(req.body?.deliveryFee);
        if (!Number.isFinite(subtotal) || !Number.isFinite(deliveryFee)) {
            return BadRequestStatus(res, "subtotal and deliveryFee must be numbers");
        }

        try {
            return SuccessStatus(
                res,
                await service.applyCoupon({
                    couponCode: code,
                    subtotal,
                    deliveryFee,
                })
            );
        } catch (error) {
            if (error instanceof CouponError) {
                // A code that does not exist is a 404; one that exists but cannot
                // be spent right now is a 409, so the storefront can tell the
                // customer what to fix instead of implying a typo.
                if (error.code === "INVALID_COUPON") {
                    return NotFoundStatus(res, error.message);
                }
                return ConflictStatus(res, error.message);
            }
            throw error;
        }
    };

    return { getCoupons, validateCoupon };
};
