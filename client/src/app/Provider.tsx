import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async";
import Router from "./Router"

const Provider = () => {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <Router />
            </HelmetProvider>
        </BrowserRouter>
    )
}
export default Provider