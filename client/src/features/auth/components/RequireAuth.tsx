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

    // Customers are sent home; a branch admin belongs on their branch
    // dashboard, not in the main-admin area. Staff and admins stay.
    if (user?.role === "customer") {
        return <Navigate to="/" replace />;
    }
    if (user?.role === "branch_admin") {
        return <Navigate to="/branch" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;