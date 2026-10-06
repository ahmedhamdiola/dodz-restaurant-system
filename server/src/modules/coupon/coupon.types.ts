export type CouponType = "percentage" | "fixed_amount" | "free_delivery";

export interface Coupon {
    id: number;
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    maxUses: number | null;
    isActive: boolean;
    isDeleted: boolean;
    expiresAt: string;
}

export interface CouponApplyInput {
    couponCode: string;
    subtotal: number;
    deliveryFee: number;
}

export interface CouponApplyResult {
    couponId: number;
    couponCode: string;
    type: CouponType;
    /** What actually came off the order total in this application. */
    discount: number;
}

export class CouponError extends Error {
    constructor(public code: "INVALID_COUPON" | "COUPON_EXPIRED" | "MINIMUM_NOT_MET" | "COUPON_MAX_USES_REACHED" | "COUPON_INACTIVE", message: string) {
        super(message);
        this.name = "CouponError";
    }
}
