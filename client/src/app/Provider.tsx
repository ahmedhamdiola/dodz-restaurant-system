import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { Provider as ReduxProvider } from "react-redux"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"
import { ThemeProvider } from "../contexts/theme/providers/ThemeProvider";
import { AuthProvider } from "../features/auth/providers/AuthProvider";
import { FavoritesProvider } from "../features/products/favorites/providers/FavoritesProvider";
import { CartProvider } from "../features/cart/providers/CartProvider";
import { OrderTypeProvider } from "../features/order/providers/OrderTypeProvider";
import { OrderLocationProvider } from "../features/order-location/providers/OrderLocationProvider";
import { ToastProvider } from "../components/toast/ToastProvider";
import { queryClient } from "../lib/queryClient";
import { store } from "./store";

const Provider = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ReduxProvider store={store}>
            <BrowserRouter>
                <HelmetProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            <OrderTypeProvider>
                                <OrderLocationProvider>
                                    <AuthProvider>
                                        <FavoritesProvider>
                                            <CartProvider>
                                                <Router />
                                            </CartProvider>
                                        </FavoritesProvider>
                                    </AuthProvider>
                                </OrderLocationProvider>
                            </OrderTypeProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </HelmetProvider>
            </BrowserRouter>
            </ReduxProvider>
        </QueryClientProvider>
    )
}
export default Provider