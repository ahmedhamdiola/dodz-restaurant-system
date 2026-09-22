import { Helmet } from "react-helmet-async";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Logo from "../../assets/logos/Logo.svg";
import Spinner from "../../features/auth/components/Spinner";
import { useAuth } from "../../features/auth/hooks/useAuth";
import FavoritesSection from "../../features/profile/components/FavoritesSection";
import LogoutButton from "../../features/profile/components/LogoutButton";
import PastOrdersSection from "../../features/profile/components/PastOrdersSection";
import UserInfoCard from "../../features/profile/components/UserInfoCard";
import { useCustomerOrders } from "../../features/profile/hooks/useCustomerOrders";
import { useProfileFavorites } from "../../features/profile/hooks/useProfileFavorites";
import type { ProfileUser } from "../../features/profile/types";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isBootstrapping, logout } = useAuth();
    const ordersQuery = useCustomerOrders(user?.phone);
    const { favoriteProducts, removeFavorite } = useProfileFavorites();

    if (isBootstrapping) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <Spinner className="h-8 w-8 text-brand" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login?redirect=/profile" replace />;
    }

    const profileUser: ProfileUser = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            <Helmet>
                <title>My Profile | DODZ Fried Chicken</title>
            </Helmet>

            <div className="flex min-h-screen flex-col bg-primary">
                <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                        <Link
                            to="/"
                            aria-label="DODZ home"
                            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                            <img src={Logo} alt="DODZ Logo" className="h-9 w-auto" />
                        </Link>
                        <Link
                            to="/"
                            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary shadow-sm transition-colors duration-200 outline-none hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                            <ArrowLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            Back to site
                        </Link>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
                    <UserInfoCard user={profileUser} />
                    <FavoritesSection products={favoriteProducts} onRemoveFavorite={removeFavorite} />
                    <PastOrdersSection
                        orders={ordersQuery.data ?? []}
                        isLoading={ordersQuery.isLoading}
                        isError={ordersQuery.isError}
                        onRetry={ordersQuery.refetch}
                    />
                    <LogoutButton onLogout={handleLogout} />
                </main>
            </div>
        </>
    );
};

export default ProfilePage;