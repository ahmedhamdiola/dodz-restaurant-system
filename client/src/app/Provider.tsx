import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"
import { ThemeProvider } from "../contexts/theme/providers/ThemeProvider";
import { AuthProvider } from "../features/auth/providers/AuthProvider";
import { FavoritesProvider } from "../features/products/favorites/providers/FavoritesProvider";
import { OrderTypeProvider } from "../features/order/providers/OrderTypeProvider";
import { OrderLocationProvider } from "../features/order-location/providers/OrderLocationProvider";
import { ToastProvider } from "../components/toast/ToastProvider";
import { queryClient } from "../lib/queryClient";

const Provider = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <HelmetProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            <OrderTypeProvider>
                                <OrderLocationProvider>
                                    <AuthProvider>
                                        <FavoritesProvider>
                                            <Router />
                                        </FavoritesProvider>
                                    </AuthProvider>
                                </OrderLocationProvider>
                            </OrderTypeProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </HelmetProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}
export default Provider