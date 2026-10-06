import type { Pool, PoolClient } from "pg";
import { computeTotals, roundMoney } from "../order/order.totals.js";
import { CouponApplyInput, CouponApplyResult, CouponError } from "./coupon.types.js";
import { CouponRepository } from "./coupon.repository.js";

export const CouponService = (repo: ReturnType<typeof CouponRepository>) => {
    const applyCoupon = async (
        input: CouponApplyInput,
        client?: Pool | PoolClient
    ): Promise<CouponApplyResult> => {
        const code = input.couponCode?.trim();
        if (!code) throw new CouponError("INVALID_COUPON", "Invalid coupon code");

        const coupon = await repo.getCouponByCode(code, client);
        if (!coupon) throw new CouponError("INVALID_COUPON", "Coupon not found or not available");
        if (coupon.isDeleted) throw new CouponError("INVALID_COUPON", "Coupon not found or not available");
        if (!coupon.isActive) throw new CouponError("COUPON_INACTIVE", "This coupon is not active");

        const now = new Date();
        const expires = new Date(coupon.expiresAt);
        if (isNaN(expires.getTime()) || expires < now) {
            throw new CouponError("COUPON_EXPIRED", "This coupon has expired");
        }

        const subtotal = roundMoney(Math.max(Number(input.subtotal) || 0, 0));
        if (subtotal < roundMoney(Math.max(Number(coupon.minOrderAmount) || 0, 0))) {
            throw new CouponError("MINIMUM_NOT_MET", "Order subtotal does not meet the minimum for this coupon");
        }

        if (coupon.maxUses !== null && coupon.maxUses !== undefined) {
            const used = await repo.getCouponUsageCount(coupon.id, client);
            if (used >= coupon.maxUses) {
                throw new CouponError("COUPON_MAX_USES_REACHED", "This coupon has reached its maximum uses");
            }
        }

        let discount = 0;
        if (coupon.type === "percentage") {
            discount = roundMoney((subtotal * coupon.value) / 100);
        } else if (coupon.type === "fixed_amount") {
            discount = roundMoney(Math.max(Number(coupon.value) || 0, 0));
        } else if (coupon.type === "free_delivery") {
            // Free delivery means discount equals delivery fee (waived).
            discount = roundMoney(Math.max(Number(input.deliveryFee) || 0, 0));
        }

        // Never discount more than subtotal; clamp via computeTotals rules is authoritative but
        // we also clamp here defensively before writing to order_coupons snapshot.
        const { discount: clamped } = computeTotals(subtotal, discount, 0);
        discount = clamped;

        return {
            couponId: coupon.id,
            couponCode: coupon.code,
            type: coupon.type,
            discount,
        };
    };

    return { applyCoupon };
};
