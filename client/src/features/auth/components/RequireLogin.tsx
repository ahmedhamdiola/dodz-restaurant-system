import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

interface RequireLoginProps {
    children: ReactNode;
}

/**
 * Role-agnostic logged-in guard. Unlike RequireAuth (admin area), this keeps
 * any authenticated session — customers, staff and admins alike — so it is
 * suitable for account pages like /profile.
 */
const RequireLogin = ({ children }: RequireLoginProps) => {
    const { isAuthenticated, isBootstrapping } = useAuth();
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

    return <>{children}</>;
};

export default RequireLogin;