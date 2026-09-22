import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

interface RequireAuthProps {
    children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
    const { user, isAuthenticated, isBootstrapping } = useAuth();
    const { pathname } = useLocation();

    if (isBootstrapping) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <Spinner className="h-8 w-8 text-brand" />
            </div>
        );
    }

    if (!isAuthenticated) {
        const redirect = encodeURIComponent(pathname);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    // Customers are sent home; only staff/admin may use the admin area.
    if (user?.role === "customer") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;