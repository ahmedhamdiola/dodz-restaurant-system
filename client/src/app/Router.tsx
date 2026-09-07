import { Route, Routes } from "react-router-dom"
import LandingPage from "./routes/LandingPage"

const Router = () => {
    return (
        <Routes>
            <Route index element={<LandingPage />} />
        </Routes>
    )
}

export default Router