import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { cartService } from "../services/cartApi";
import type { CartView, CheckoutPayload, OrderView } from "../types";
import { MAX_QUANTITY } from "../types";

// ---------------------------------------------------------------------------
// Redux Toolkit cart API. The server cart is the single source of truth; each
// endpoint is wrapped over the axios service. Scope (user:id | guest:token) is
// part of every arg so caches are isolated per identity.
//
// Mutations are optimistic: they patch the matching getCart cache entry first,
// then reconcile with the authoritative server response and roll back on error.
// ---------------------------------------------------------------------------

// No endpoint uses the baseQuery directly (all use queryFn against the axios
// service); this satisfies createApi's required baseQuery.
const unusedBaseQuery = fetchBaseQuery({ baseUrl: "/" });

const emptyCart = (): CartView => ({
    items: [],
    distinct_item_count: 0,
    item_count: 0,
    subtotal: 0,
});

const recomputeDraft = (draft: CartView) => {
    draft.distinct_item_count = draft.items.length;
    draft.item_count = draft.items.reduce((sum, item) => sum + item.quantity, 0);
    draft.subtotal = draft.items.reduce((sum, item) => sum + item.subtotal, 0);
};

const clamp = (quantity: number) => Math.min(Math.max(quantity, 0), MAX_QUANTITY);

export interface AddItemArgs {
    productID: number;
    quantity?: number;
    scope: string;
}

export interface UpdateQuantityArgs {
    productID: number;
    quantity: number;
    scope: string;
}

export interface RemoveItemArgs {
    productID: number;
    scope: string;
}

export interface MergeCartArgs {
    guestToken: string;
    scope: string;
}

export type CheckoutArgs = CheckoutPayload & { scope: string };

export const cartApi = createApi({
    reducerPath: "cartApi",
    baseQuery: unusedBaseQuery,
    refetchOnFocus: true, // keep tabs in sync with the server cart (guest edits elsewhere)
    refetchOnReconnect: true,
    tagTypes: [],
    keepUnusedDataFor: 0, // never let a previous identity's cart linger in the store
    endpoints: (builder) => ({
        getCart: builder.query<CartView, string>({
            queryFn: () => cartService.get().then((data) => ({ data })),
        }),

        addItem: builder.mutation<CartView, AddItemArgs>({
            queryFn: ({ productID, quantity }) =>
                cartService.addItem(productID, quantity ?? 1).then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        const existing = draft.items.find((item) => item.product_id === arg.productID);
                        if (existing) {
                            existing.quantity = clamp(existing.quantity + (arg.quantity ?? 1));
                            existing.subtotal = existing.unit_price * existing.quantity;
                            recomputeDraft(draft);
                        }
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", arg.scope, () => data));
                } catch {
                    patch.undo();
                }
            },
        }),

        updateQuantity: builder.mutation<CartView, UpdateQuantityArgs>({
            queryFn: ({ productID, quantity }) =>
                cartService.updateQuantity(productID, quantity).then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        const existing = draft.items.find((item) => item.product_id === arg.productID);
                        if (existing) {
                            existing.quantity = arg.quantity;
                            existing.subtotal = existing.unit_price * arg.quantity;
                            recomputeDraft(draft);
                        }
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", arg.scope, () => data));
                } catch {
                    patch.undo();
                }
            },
        }),

        removeItem: builder.mutation<CartView, RemoveItemArgs>({
            queryFn: ({ productID }) => cartService.removeItem(productID).then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        draft.items = draft.items.filter((item) => item.product_id !== arg.productID);
                        recomputeDraft(draft);
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", arg.scope, () => data));
                } catch {
                    patch.undo();
                }
            },
        }),

        clearCart: builder.mutation<CartView, string>({
            queryFn: () => cartService.clear().then((data) => ({ data })),
            onQueryStarted: async (scope, { dispatch, queryFulfilled }) => {
                const patch = dispatch(cartApi.util.updateQueryData("getCart", scope, () => emptyCart()));
                try {
                    const { data } = await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", scope, () => data));
                } catch {
                    patch.undo();
                }
            },
        }),

        mergeCart: builder.mutation<CartView, MergeCartArgs>({
            queryFn: ({ guestToken }) => cartService.merge(guestToken).then((data) => ({ data })),
            onQueryStarted: async ({ scope }, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", scope, () => data));
                } catch {
                    // Guest cart already consumed/unreachable; nothing to reconcile.
                }
            },
        }),

        checkout: builder.mutation<OrderView, CheckoutArgs>({
            queryFn: ({ branchID, customerName, customerPhone, idempotencyKey }) =>
                cartService
                    .checkout({ branchID, customerName, customerPhone, idempotencyKey })
                    .then((data) => ({ data })),
            onQueryStarted: async ({ scope }, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(cartApi.util.updateQueryData("getCart", scope, () => emptyCart()));
                } catch {
                    // Order failed; keep the cart as-is so the user can retry.
                }
            },
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddItemMutation,
    useUpdateQuantityMutation,
    useRemoveItemMutation,
    useClearCartMutation,
    useMergeCartMutation,
    useCheckoutMutation,
} = cartApi;