import { useCallback, useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import type { AuthUser } from "../../auth/types";
import { getGuestToken } from "../lib/guestToken";
import {
    useAddItemMutation,
    useCheckoutMutation,
    useClearCartMutation,
    useGetCartQuery,
    useMergeCartMutation,
    useRemoveItemMutation,
    useUpdateQuantityMutation,
} from "../redux/cartApi";
import type { CartView, CheckoutPayload, OrderView } from "../types";

export const getCartScope = (user: AuthUser | null): string =>
    user ? `user:${user.id}` : `guest:${getGuestToken()}`;

export const useCartScope = () => {
    const { user } = useAuth();
    return useMemo(() => getCartScope(user), [user]);
};

interface MutationCallbacks<T> {
    onSuccess?: (data: T) => void;
    onError?: (err: unknown) => void;
}

/** Runs callbacks attached by callers without leaving a dangling promise. */
const attach = <T>(promise: Promise<T>, options?: MutationCallbacks<T>): Promise<T> => {
    if (options?.onSuccess || options?.onError) {
        void promise.then(
            (data) => options.onSuccess?.(data),
            (err) => options.onError?.(err)
        );
    }
    return promise;
};

const isPending = (result: { isLoading: boolean; status?: string }): boolean =>
    result.isLoading || result.status === "pending";

export const useCart = () => {
    const scope = useCartScope();
    return useGetCartQuery(scope);
};

export const useAddItem = () => {
    const scope = useCartScope();
    const [trigger, result] = useAddItemMutation();
    const mutate = useCallback(
        (vars: { productID: number; quantity?: number }, options?: MutationCallbacks<CartView>) =>
            attach(trigger({ ...vars, scope }).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};

export const useUpdateQuantity = () => {
    const scope = useCartScope();
    const [trigger, result] = useUpdateQuantityMutation();
    const mutate = useCallback(
        (vars: { productID: number; quantity: number }, options?: MutationCallbacks<CartView>) =>
            attach(trigger({ ...vars, scope }).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};

export const useRemoveItem = () => {
    const scope = useCartScope();
    const [trigger, result] = useRemoveItemMutation();
    const mutate = useCallback(
        (productID: number, options?: MutationCallbacks<CartView>) =>
            attach(trigger({ productID, scope }).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};

export const useClearCart = () => {
    const scope = useCartScope();
    const [trigger, result] = useClearCartMutation();
    const mutate = useCallback(
        (options?: MutationCallbacks<CartView>) => attach(trigger(scope).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};

/** Absorbs a guest cart into the authenticated user's cart (merge-on-login). */
export const useMergeCart = () => {
    const scope = useCartScope();
    const [trigger, result] = useMergeCartMutation();
    const mutate = useCallback(
        (guestToken: string, options?: MutationCallbacks<CartView>) =>
            attach(trigger({ guestToken, scope }).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};

export const useCheckout = () => {
    const scope = useCartScope();
    const [trigger, result] = useCheckoutMutation();
    const mutate = useCallback(
        (payload: CheckoutPayload, options?: MutationCallbacks<OrderView>) =>
            attach(trigger({ ...payload, scope }).unwrap(), options),
        [trigger, scope]
    );
    return { mutate, mutateAsync: mutate, isPending: isPending(result), isError: result.isError, error: result.error, reset: result.reset };
};