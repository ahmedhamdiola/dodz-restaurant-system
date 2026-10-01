import { api, unwrap } from "../../../lib/api";
import { getGuestToken } from "../lib/guestToken";
import type { AddItemPayload, CartView, CheckoutPayload, OrderView } from "../types";

const guestHeaders = () => {
    const token = getGuestToken();
    return token ? { "X-Guest-Token": token } : {};
};

interface ErrorLike {
    response?: { data?: { message?: string } };
    message?: string;
}

/** Maps raw axios/network failures to a stable user-facing message. */
export const getCartErrorMessage = (err: unknown, fallback: string): string => {
    const like = err as ErrorLike;
    if (like.response?.data?.message) {
        return like.response.data.message;
    }
    if (like.message) {
        return like.message;
    }
    return fallback;
};

/**
 * Rewrites rejected requests into a plain Error whose `message` is the server's
 * message. RTK Query serializes queryFn rejections, stripping axios internals,
 * so the message-level copy is what survives into the mutation error.
 */
const toCartError = (err: unknown): never => {
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

export const cartService = {
    get(): Promise<CartView> {
        return unwrap<CartView>(api.get("/cart", { headers: guestHeaders() })).catch(toCartError);
    },

    addItem(payload: AddItemPayload): Promise<CartView> {
        return unwrap<CartView>(
            api.post("/cart/items", payload, { headers: guestHeaders() })
        ).catch(toCartError);
    },

    /** Mutations address the cart LINE id, not the product id. */
    updateQuantity(cartItemID: number, quantity: number): Promise<CartView> {
        return unwrap<CartView>(
            api.put(`/cart/items/${cartItemID}`, { quantity }, { headers: guestHeaders() })
        ).catch(toCartError);
    },

    removeItem(cartItemID: number): Promise<CartView> {
        return unwrap<CartView>(
            api.delete(`/cart/items/${cartItemID}`, { headers: guestHeaders() })
        ).catch(toCartError);
    },

    clear(): Promise<CartView> {
        return unwrap<CartView>(api.delete("/cart", { headers: guestHeaders() })).catch(toCartError);
    },

    merge(guestToken: string): Promise<CartView> {
        return unwrap<CartView>(api.post("/cart/merge", { guestToken }, { headers: guestHeaders() })).catch(toCartError);
    },

    checkout(payload: CheckoutPayload): Promise<OrderView> {
        return unwrap<OrderView>(api.post("/cart/checkout", payload, { headers: guestHeaders() })).catch(toCartError);
    },
};