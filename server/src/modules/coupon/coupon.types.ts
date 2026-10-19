export type CouponType = "percentage" | "fixed_amount" | "free_delivery";

export const COUPON_TYPES: CouponType[] = ["percentage", "fixed_amount", "free_delivery"];

export const isCouponType = (value: unknown): value is CouponType =>
    typeof value === "string" && (COUPON_TYPES as string[]).includes(value);

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
    /** Redemptions so far, from order_coupons. Drives the max_uses readout. */
    usageCount?: number;
}

/** What an admin sends when creating or editing a coupon. */
export interface CouponInput {
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minOrderAmount?: number;
    /** null or absent means unlimited. */
    maxUses?: number | null;
    isActive?: boolean;
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
    constructor(
        public code:
            | "INVALID_COUPON"
            | "COUPON_CODE_TAKEN"
            | "COUPON_EXPIRED"
            | "MINIMUM_NOT_MET"
            | "COUPON_MAX_USES_REACHED"
            | "COUPON_INACTIVE"
            /** The admin path only: no such coupon row to edit or delete. */
            | "COUPON_NOT_FOUND",
        message: string
    ) {
        super(message);
        this.name = "CouponError";
    }
}
