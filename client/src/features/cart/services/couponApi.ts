import { api, unwrap } from "../../../lib/api";

export type CouponType = "percentage" | "fixed_amount" | "free_delivery";

/** What the server says a code would take off. A quote, never a promise. */
export interface CouponQuote {
    couponId: number;
    couponCode: string;
    type: CouponType;
    discount: number;
}

interface ErrorLike {
    response?: { data?: { message?: string } };
    message?: string;
}

/**
 * Rewrites rejected requests into an Error carrying the server's message. RTK
 * Query serializes queryFn rejections and strips axios internals, so the
 * message is the only part that survives into the mutation error.
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

export const couponService = {
    /**
     * Asks the server what a code is worth against this basket.
     *
     * The subtotal here is the cart's own quote and the delivery fee is what the
     * selected branch charges. Neither is trusted: checkout re-applies the code
     * inside the transaction against the re-priced cart, so an expired or
     * newly-spent code fails there with a message rather than silently pricing
     * the order without the discount.
     */
    validate(code: string, subtotal: number, deliveryFee: number): Promise<CouponQuote> {
        return unwrap<CouponQuote>(
            api.post("/coupons/validate", { code, subtotal, deliveryFee })
        ).catch(toError);
    },
};
