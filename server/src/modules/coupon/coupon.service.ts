import type { Pool, PoolClient } from "pg";
import { computeTotals, roundMoney } from "../order/order.totals.js";
import {
    Coupon,
    CouponApplyInput,
    CouponApplyResult,
    CouponError,
    CouponInput,
} from "./coupon.types.js";
import { CouponRepository } from "./coupon.repository.js";

/** coupons.code is VARCHAR(32). */
const MAX_CODE_LENGTH = 32;
const MAX_NAME_LENGTH = 150;

export const CouponService = (repo: ReturnType<typeof CouponRepository>) => {
    /**
     * Rejects the shapes the database CHECKs would otherwise catch as a 500, so
     * the admin form can tell the author what is wrong. The DB still enforces
     * these — this is about the message, not about safety.
     */
    const validateInput = (input: CouponInput): string | null => {
        if (!input.code || !input.code.trim()) return "Coupon code is required";
        if (input.code.trim().length > MAX_CODE_LENGTH) {
            return `Coupon code must be ${MAX_CODE_LENGTH} characters or fewer`;
        }
        if (!input.name || !input.name.trim()) return "Coupon name is required";
        if (input.name.trim().length > MAX_NAME_LENGTH) {
            return `Coupon name must be ${MAX_NAME_LENGTH} characters or fewer`;
        }

        if (input.type === "percentage") {
            if (!(input.value > 0) || input.value > 100) {
                return "A percentage coupon must be between 1 and 100";
            }
        } else if (input.type === "fixed_amount") {
            if (!(input.value > 0)) return "A fixed-amount coupon must be greater than zero";
        } else if (input.type === "free_delivery") {
            // Delivery is charged by the serving branch, so there is no amount to
            // store. Any non-zero value here would be silently ignored at checkout.
            if (input.value !== 0) return "A free-delivery coupon cannot have an amount";
        }

        if (!Number.isFinite(input.minOrderAmount ?? 0) || (input.minOrderAmount ?? 0) < 0) {
            return "Minimum spend cannot be negative";
        }
        if (
            input.maxUses !== undefined &&
            input.maxUses !== null &&
            (!Number.isInteger(input.maxUses) || input.maxUses < 1)
        ) {
            return "Maximum uses must be a whole number of at least 1";
        }
        if (!input.expiresAt || Number.isNaN(new Date(input.expiresAt).getTime())) {
            return "A valid expiry date is required";
        }

        return null;
    };

    const getCoupons = async (): Promise<Coupon[]> => repo.getAllCoupons();

    const createCoupon = async (input: CouponInput): Promise<Coupon> => {
        const invalid = validateInput(input);
        if (invalid !== null) throw new CouponError("INVALID_COUPON", invalid);

        const code = input.code.trim();
        if (await repo.codeExists(code)) {
            throw new CouponError("COUPON_CODE_TAKEN", "That coupon code is already in use");
        }

        return repo.createCoupon({ ...input, code, name: input.name.trim() });
    };

    const updateCoupon = async (id: number, input: CouponInput): Promise<Coupon | null> => {
        const invalid = validateInput(input);
        if (invalid !== null) throw new CouponError("INVALID_COUPON", invalid);

        if ((await repo.getCouponByID(id)) === null) return null;

        const code = input.code.trim();
        if (await repo.codeExists(code, id)) {
            throw new CouponError("COUPON_CODE_TAKEN", "That coupon code is already in use");
        }

        return repo.updateCoupon(id, { ...input, code, name: input.name.trim() });
    };

    const deleteCoupon = async (id: number): Promise<boolean> => repo.softDeleteCoupon(id);

    /**
     * Checks a code against a quote without consuming it, so the storefront can
     * say "this will save you X" before checkout. The amount is not authoritative:
     * subtotal and delivery fee are still client-supplied here. Checkout
     * re-evaluates the same code against the re-priced cart.
     */
    const applyCoupon = async (
        input: CouponApplyInput,
        client?: Pool | PoolClient
    ): Promise<CouponApplyResult> => {
        const code = input.couponCode?.trim();
        if (!code) throw new CouponError("INVALID_COUPON", "Invalid coupon code");

        const coupon = await repo.getCouponByCode(code, client);
        if (coupon === null) throw new CouponError("INVALID_COUPON", "Coupon not found or not available");
        if (!coupon.isActive) throw new CouponError("COUPON_INACTIVE", "This coupon is not active");

        const expires = new Date(coupon.expiresAt);
        if (Number.isNaN(expires.getTime()) || expires.getTime() < Date.now()) {
            throw new CouponError("COUPON_EXPIRED", "This coupon has expired");
        }

        const subtotal = roundMoney(Math.max(Number(input.subtotal) || 0, 0));
        if (subtotal < roundMoney(Math.max(coupon.minOrderAmount, 0))) {
            throw new CouponError(
                "MINIMUM_NOT_MET",
                "Order subtotal does not meet the minimum for this coupon"
            );
        }

        if (coupon.maxUses !== null) {
            const used = await repo.getCouponUsageCount(coupon.id, client);
            if (used >= coupon.maxUses) {
                throw new CouponError("COUPON_MAX_USES_REACHED", "This coupon has reached its maximum uses");
            }
        }

        let discount = 0;
        if (coupon.type === "percentage") {
            discount = roundMoney((subtotal * coupon.value) / 100);
        } else if (coupon.type === "fixed_amount") {
            discount = roundMoney(coupon.value);
        } else {
            // Free delivery is worth exactly the fee it waives, which the serving
            // branch decides. On a pickup the fee is 0 and so is the discount.
            discount = roundMoney(Math.max(Number(input.deliveryFee) || 0, 0));
        }

        // A fixed-amount code larger than the basket must not produce a negative
        // total; orders_total_invariant_check would reject the INSERT. Clamping
        // here keeps the quote and the receipt agreeing.
        discount = computeTotals(subtotal, discount, 0).discount;

        return {
            couponId: coupon.id,
            couponCode: coupon.code,
            type: coupon.type,
            discount,
        };
    };

    return { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon };
};
