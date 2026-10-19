import { Route, Routes } from "react-router-dom"
import LandingPage from "./routes/LandingPage"
import MainLayout from "./layouts/MainLayout"
import AuthPage from "./routes/AuthPage"
import MenuPage from "./routes/MenuPage"
import StoreLocationsPage from "./routes/StoreLocationsPage"
import ContactPage from "./routes/ContactPage"
import TermsPage from "./routes/TermsPage"
import PrivacyPolicyPage from "./routes/PrivacyPolicyPage"
import AdminLayout from "./layouts/AdminLayout"
import RequireAuth from "../features/auth/components/RequireAuth"
import RequireBranchAdmin from "../features/auth/components/RequireBranchAdmin"
import RequireLogin from "../features/auth/components/RequireLogin"
import ProfilePage from "./routes/ProfilePage"
import FavoritesPage from "./routes/FavoritesPage"
import DashboardPage from "./routes/admin/DashboardPage"
import AlertsPage from "./routes/admin/AlertsPage"
import StudioPage from "./routes/admin/StudioPage"
import ProductsPage from "./routes/admin/ProductsPage"
import UsersPage from "./routes/admin/UsersPage"
import OrdersPage from "./routes/admin/OrdersPage"
import BranchesPage from "./routes/admin/BranchesPage"
import SettingsPage from "./routes/admin/SettingsPage"
import BranchLayout from "./layouts/BranchLayout"
import BranchStockPage from "./routes/branch/StockPage"
import BranchAlertsPage from "./routes/branch/AlertsPage"

const Router = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:categorySlug" element={<MenuPage />} />
                <Route path="/store-locations" element={<StoreLocationsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms-and-conditions" element={<TermsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            </Route>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route
                path="/profile"
                element={
                    <RequireLogin>
                        <ProfilePage />
                    </RequireLogin>
                }
            />
            <Route
                path="/admin"
                element={
                    <RequireAuth>
                        <AdminLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="studio" element={<StudioPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
            </Route>

            <Route
                path="/branch"
                element={
                    <RequireBranchAdmin>
                        <BranchLayout />
                    </RequireBranchAdmin>
                }
            >
                <Route index element={<BranchStockPage />} />
                <Route path="alerts" element={<BranchAlertsPage />} />
            </Route>
        </Routes>
    )
}

export default Router