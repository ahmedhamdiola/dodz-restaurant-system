import { Route, Routes } from "react-router-dom"
import LandingPage from "./routes/LandingPage"
import MainLayout from "./layouts/MainLayout"

const Router = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<LandingPage />} />
            </Route>
        </Routes>
    )
}

export default Router