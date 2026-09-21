import { Route, Routes } from "react-router-dom"
import LandingPage from "./routes/LandingPage"
import MainLayout from "./layouts/MainLayout"
import MenuPage from "./routes/MenuPage"
import StoreLocationsPage from "./routes/StoreLocationsPage"
import ContactPage from "./routes/ContactPage"
import TermsPage from "./routes/TermsPage"
import PrivacyPolicyPage from "./routes/PrivacyPolicyPage"
import AdminLayout from "./layouts/AdminLayout"
import DashboardPage from "./routes/admin/DashboardPage"
import StudioPage from "./routes/admin/StudioPage"
import ProductsPage from "./routes/admin/ProductsPage"
import UsersPage from "./routes/admin/UsersPage"
import OrdersPage from "./routes/admin/OrdersPage"
import BranchesPage from "./routes/admin/BranchesPage"
import SettingsPage from "./routes/admin/SettingsPage"

const Router = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:categorySlug" element={<MenuPage />} />
                <Route path="/store-locations" element={<StoreLocationsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms-and-conditions" element={<TermsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="studio" element={<StudioPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    )
}

export default Router