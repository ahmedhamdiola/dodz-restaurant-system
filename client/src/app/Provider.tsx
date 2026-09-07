import { BrowserRouter } from "react-router-dom"
import Router from "./Router"

const Provider = () => {
    return (
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    )
}
export default Provider