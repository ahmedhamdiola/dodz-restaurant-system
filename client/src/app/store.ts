import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { cartApi } from "../features/cart/redux/cartApi";
import { customizeApi } from "../features/products/customize/redux/customizeApi";

export const store = configureStore({
    reducer: {
        [cartApi.reducerPath]: cartApi.reducer,
        [customizeApi.reducerPath]: customizeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cartApi.middleware, customizeApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;