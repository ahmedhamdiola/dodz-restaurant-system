import type { Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { CouponService } from "./coupon.service.js";
import { CouponError, isCouponType } from "./coupon.types.js";
import {
    BadRequestStatus,
    ConflictStatus,
    CreateStatus,
    DeletedStatus,
    NotFoundStatus,
    SuccessStatus,
} from "../../utils/response.js";

const repo = CouponRepository();
const service = CouponService(repo);

/**
 * Reads the admin write payload off the body. Everything is validated in the
 * service rather than here, so the same rules apply no matter which caller
 * eventually writes a coupon.
 */
const readInput = (req: Request) => ({
    code: typeof req.body?.code === "string" ? req.body.code : "",
    name: typeof req.body?.name === "string" ? req.body.name : "",
    type: req.body?.type,
    value: Number(req.body?.value),
    minOrderAmount: Number(req.body?.minOrderAmount ?? 0),
    // absent, null or "" all mean "unlimited", which is how the admin form
    // expresses it rather than sending 0.
    maxUses:
        req.body?.maxUses === undefined || req.body?.maxUses === null || req.body?.maxUses === ""
            ? null
            : Number(req.body.maxUses),
    isActive: req.body?.isActive === undefined ? true : Boolean(req.body.isActive),
    expiresAt: typeof req.body?.expiresAt === "string" ? req.body.expiresAt : "",
});

export const CouponController = () => {
    const getCoupons = async (_req: Request, res: Response) => {
        return SuccessStatus(res, await service.getCoupons());
    };

    const createCoupon = async (req: Request, res: Response) => {
        const input = readInput(req);
        if (!isCouponType(input.type)) {
            return BadRequestStatus(res, "Coupon type must be percentage, fixed_amount or free_delivery");
        }

        try {
            return CreateStatus(res, await service.createCoupon({ ...input, type: input.type }));
        } catch (error) {
            if (error instanceof CouponError) {
                // A taken code is a conflict on an otherwise well-formed request,
                // not a 404: the resource it wants to create cannot exist.
                return ConflictStatus(res, error.message);
            }
            throw error;
        }
    };

    const updateCoupon = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return BadRequestStatus(res, "Invalid coupon id");
        }

        const input = readInput(req);
        if (!isCouponType(input.type)) {
            return BadRequestStatus(res, "Coupon type must be percentage, fixed_amount or free_delivery");
        }

        try {
            const updated = await service.updateCoupon(id, { ...input, type: input.type });
            if (updated === null) {
                return NotFoundStatus(res, "Coupon not found");
            }
            return SuccessStatus(res, updated);
        } catch (error) {
            if (error instanceof CouponError) {
                return ConflictStatus(res, error.message);
            }
            throw error;
        }
    };

    /**
     * Soft delete. Past orders keep referencing the coupon through
     * order_coupons, so the row stays and simply stops being redeemable.
     */
    const deleteCoupon = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return BadRequestStatus(res, "Invalid coupon id");
        }

        if (!(await service.deleteCoupon(id))) {
            return NotFoundStatus(res, "Coupon not found");
        }
        return DeletedStatus(res, "Coupon deleted");
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

    return { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
};
