import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"
import { ThemeProvider } from "../contexts/theme/providers/ThemeProvider";
import { FavoritesProvider } from "../features/products/favorites/providers/FavoritesProvider";
import { OrderTypeProvider } from "../features/order/providers/OrderTypeProvider";
import { OrderLocationProvider } from "../features/order-location/providers/OrderLocationProvider";

const Provider = () => {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <ThemeProvider>
                    <OrderTypeProvider>
                        <OrderLocationProvider>
                            <FavoritesProvider>
                                <Router />
                            </FavoritesProvider>
                        </OrderLocationProvider>
                    </OrderTypeProvider>
                </ThemeProvider>
            </HelmetProvider>
        </BrowserRouter>
    )
}
export default Provider