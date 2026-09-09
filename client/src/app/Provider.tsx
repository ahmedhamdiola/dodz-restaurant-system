import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"
import { ThemeProvider } from "../contexts/theme/providers/ThemeProvider";

const Provider = () => {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <ThemeProvider>
                    <Router />
                </ThemeProvider>
            </HelmetProvider>
        </BrowserRouter>
    )
}
export default Provider