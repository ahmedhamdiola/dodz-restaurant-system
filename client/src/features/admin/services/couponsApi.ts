import { api, unwrap } from "../../../lib/api";
import type { AdminCoupon, CouponInput } from "../types";

interface ErrorLike {
    response?: { data?: { message?: string } };
    message?: string;
}

/**
 * Rewrites rejections into an Error carrying the server's message. react-query
 * serializes mutation errors, so the message is the only part that survives to
 * the form's error slot.
 */
const toError = (err: unknown): never => {
    if (err instanceof Error) {
        throw err;
    }
    const like = err as ErrorLike;
    if (like.response?.data?.message) {
        const error = new Error(like.response.data.message) as Error & ErrorLike;
        error.response = like.response;
        throw error;
    }
    throw err;
};

/** "2026-10-20" for a <input type="date">, in local time so it round-trips. */
const toDateInputValue = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const couponsApi = {
    getCoupons(): Promise<AdminCoupon[]> {
        return unwrap<AdminCoupon[]>(api.get("/coupons")).catch(toError);
    },

    createCoupon(input: CouponInput): Promise<AdminCoupon> {
        return unwrap<AdminCoupon>(api.post("/coupons", input)).catch(toError);
    },

    updateCoupon(id: number, input: CouponInput): Promise<AdminCoupon> {
        return unwrap<AdminCoupon>(api.put(`/coupons/${id}`, input)).catch(toError);
    },

    /**
     * A soft delete server-side: past orders still reference the coupon, so the
     * row stays and simply stops being redeemable.
     */
    deleteCoupon(id: number): Promise<void> {
        return unwrap<unknown>(api.delete(`/coupons/${id}`)).then(() => undefined).catch(toError);
    },
};

export { toDateInputValue };
