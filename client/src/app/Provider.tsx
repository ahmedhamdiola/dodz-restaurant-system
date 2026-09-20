import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"
import { ThemeProvider } from "../contexts/theme/providers/ThemeProvider";
import { FavoritesProvider } from "../features/products/favorites/providers/FavoritesProvider";

const Provider = () => {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <ThemeProvider>
                    <FavoritesProvider>
                        <Router />
                    </FavoritesProvider>
                </ThemeProvider>
            </HelmetProvider>
        </BrowserRouter>
    )
}
export default Provider