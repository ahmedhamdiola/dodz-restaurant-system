import { Route, Routes } from "react-router-dom"
import LandingPage from "./routes/LandingPage"
import MainLayout from "./layouts/MainLayout"
import MenuPage from "./routes/MenuPage"

const Router = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:categorySlug" element={<MenuPage />} />
            </Route>
        </Routes>
    )
}

export default Router