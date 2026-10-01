import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { optionsApi } from "../../../admin/services/optionsApi";
import type { ReplaceOptionsPayload } from "../../../admin/services/optionsApi";
import { customizeService } from "../services/customizeService";
import type { ModifierProduct, OptionGroup } from "../types";

// ---------------------------------------------------------------------------
// Redux Toolkit API for meal customization. The option tree is read by both the
// storefront customizer and the admin builder, and the same resource feeds the
// cart's option-aware add, so it lives here next to the cart's own RTK slice
// instead of in a second, parallel server-state system.
//
// One tag per product keeps the two readers in sync for free: the storefront
// entry (includeUnavailable: false) and the admin entry (true) are distinct
// cache keys, but both are covered by the same `ProductOptions` tag, so saving
// a tree refreshes the customer's next open of that product too.
// ---------------------------------------------------------------------------

const unusedBaseQuery = fetchBaseQuery({ baseUrl: "/" });

export interface ProductOptionsArgs {
    productID: number;
    /**
     * Admin-only. When true the server includes sold-out groups/values so the
     * builder never makes a row disappear.
     */
    includeUnavailable?: boolean;
}

export interface ReplaceOptionsArgs {
    productID: number;
    payload: ReplaceOptionsPayload;
}

export const customizeApi = createApi({
    reducerPath: "customizeApi",
    baseQuery: unusedBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: 60,
    tagTypes: ["ProductOptions", "OptionModifiers"],
    endpoints: (builder) => ({
        getProductOptions: builder.query<OptionGroup[], ProductOptionsArgs>({
            queryFn: ({ productID, includeUnavailable }) =>
                customizeService
                    .getOptions(productID, includeUnavailable ?? false)
                    .then((data) => ({ data })),
            providesTags: (_result, _error, { productID }) => [
                { type: "ProductOptions", id: productID },
            ],
        }),

        getOptionModifiers: builder.query<ModifierProduct[], void>({
            queryFn: () => customizeService.getModifiers().then((data) => ({ data })),
            providesTags: ["OptionModifiers"],
        }),

        /**
         * Full replace of a product's option tree. The server response is already
         * the canonical tree, so it is written straight into the cache for this
         * product and every other reader of the tag is invalidated.
         */
        replaceOptions: builder.mutation<OptionGroup[], ReplaceOptionsArgs>({
            queryFn: ({ productID, payload }) =>
                optionsApi.replaceOptions(productID, payload).then((data) => ({ data })),
            onQueryStarted: async ({ productID }, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // Seed the admin's own entry immediately. Deliberately scoped to
                    // `includeUnavailable: true`: the storefront's entry must never
                    // receive sold-out rows, so the tag invalidation below is what
                    // refreshes it.
                    dispatch(
                        customizeApi.util.upsertQueryData(
                            "getProductOptions",
                            { productID, includeUnavailable: true },
                            data
                        )
                    );
                } catch {
                    // The mutation's own error is surfaced to the caller.
                }
            },
            invalidatesTags: (_result, _error, { productID }) => [
                { type: "ProductOptions", id: productID },
            ],
        }),
    }),
});

export const {
    useGetProductOptionsQuery,
    useLazyGetProductOptionsQuery,
    useGetOptionModifiersQuery,
    useReplaceOptionsMutation,
} = customizeApi;
