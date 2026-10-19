import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

interface RequireBranchAdminProps {
    children: ReactNode;
}

/**
 * Mirror of RequireAuth for the branch dashboard: only branch admins get in.
 * Staff/admin are sent to the main admin area, customers home, guests to login.
 */
const RequireBranchAdmin = ({ children }: RequireBranchAdminProps) => {
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

    if (user?.role === "customer") {
        return <Navigate to="/" replace />;
    }

    if (user?.role !== "branch_admin") {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default RequireBranchAdmin;
