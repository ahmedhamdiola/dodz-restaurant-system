import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AppDispatch } from "../../../app/store";
import { cartService } from "../services/cartApi";
import type { AddItemPayload, CartView, CheckoutPayload, OrderView } from "../types";
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

/**
 * Publishes the server's authoritative cart into the cache.
 *
 * A customised add cannot append a local line — its signature and price only
 * exist server-side — so the mutation response is the only thing that can put
 * the new line on screen. `upsertQueryData` is used rather than
 * `updateQueryData` because the latter is a silent no-op when the entry holds no
 * data yet, which would drop the response instead of caching it. Behaviour is
 * identical once the entry is populated; this simply removes the silent-drop
 * path.
 */
const publishCart = (dispatch: AppDispatch, scope: string, data: CartView): void => {
    dispatch(cartApi.util.upsertQueryData("getCart", scope, data));
};

/**
 * The cart line a product card "owns": the same product added without any option
 * selections. Customized lines are intentionally excluded so a card's stepper
 * never silently edits a customised item.
 */
const findPlainLine = (draft: CartView, productID: number) =>
    draft.items.find((item) => item.product_id === productID && item.options.length === 0);

export interface AddItemArgs extends AddItemPayload {
    scope: string;
}

export interface UpdateQuantityArgs {
    cartItemID: number;
    quantity: number;
    scope: string;
}

export interface RemoveItemArgs {
    cartItemID: number;
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
            queryFn: ({ productID, quantity, optionValueIDs, optionQuantities }) =>
                cartService
                    .addItem({
                        productID,
                        quantity: quantity ?? 1,
                        optionValueIDs,
                        // Omitted entirely when empty so plain adds stay byte-identical
                        // to what the server saw before counted groups existed.
                        ...(optionQuantities && optionQuantities.length > 0
                            ? { optionQuantities }
                            : {}),
                    })
                    .then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                // A customised add has no knowable local signature to match, so it
                // only patches an existing plain line and otherwise waits for the
                // server's authoritative view.
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        const existing = findPlainLine(draft, arg.productID);
                        if (existing && (arg.optionValueIDs?.length ?? 0) === 0) {
                            existing.quantity = clamp(existing.quantity + (arg.quantity ?? 1));
                            existing.subtotal = existing.unit_price * existing.quantity;
                            recomputeDraft(draft);
                        }
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    publishCart(dispatch, arg.scope, data);
                } catch {
                    patch.undo();
                }
            },
        }),

        updateQuantity: builder.mutation<CartView, UpdateQuantityArgs>({
            queryFn: ({ cartItemID, quantity }) =>
                cartService.updateQuantity(cartItemID, quantity).then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        const existing = draft.items.find((item) => item.id === arg.cartItemID);
                        if (existing) {
                            existing.quantity = arg.quantity;
                            existing.subtotal = existing.unit_price * arg.quantity;
                            recomputeDraft(draft);
                        }
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    publishCart(dispatch, arg.scope, data);
                } catch {
                    patch.undo();
                }
            },
        }),

        removeItem: builder.mutation<CartView, RemoveItemArgs>({
            queryFn: ({ cartItemID }) => cartService.removeItem(cartItemID).then((data) => ({ data })),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    cartApi.util.updateQueryData("getCart", arg.scope, (draft) => {
                        draft.items = draft.items.filter((item) => item.id !== arg.cartItemID);
                        recomputeDraft(draft);
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    publishCart(dispatch, arg.scope, data);
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
                    publishCart(dispatch, scope, data);
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
                    publishCart(dispatch, scope, data);
                } catch {
                    // Guest cart already consumed/unreachable; nothing to reconcile.
                }
            },
        }),

        checkout: builder.mutation<OrderView, CheckoutArgs>({
            queryFn: ({ branchID, customerName, customerPhone, orderType, deliveryAddress, deliveryLat, deliveryLng, idempotencyKey }) =>
                cartService
                    .checkout({
                        branchID,
                        customerName,
                        customerPhone,
                        orderType,
                        deliveryAddress,
                        deliveryLat,
                        deliveryLng,
                        idempotencyKey,
                    })
                    .then((data) => ({ data })),
            onQueryStarted: async ({ scope }, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    publishCart(dispatch, scope, emptyCart());
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