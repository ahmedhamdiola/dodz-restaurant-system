import { Link } from "react-router-dom"
import {
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "../../../features/auth/hooks/useAuth"
import { useLogout } from "../../../features/auth/hooks/useLogout"

interface SidebarAuthProps {
    onNavigate: () => void
}

const SidebarAuth = ({ onNavigate }: SidebarAuthProps) => {
    const { user, isAuthenticated, isBootstrapping } = useAuth()
    const logout = useLogout()

    if (isBootstrapping) {
        return (
            <span
                aria-hidden="true"
                className="block h-11 w-full animate-pulse rounded-lg bg-muted"
            />
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="space-y-3">
                <Link
                    to="/login"
                    onClick={onNavigate}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity duration-200 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                    <UserCircleIcon className="h-4 w-4 shrink-0" />
                    Log in
                </Link>
                <p className="text-center text-xs text-muted-foreground">
                    New to DODZ?{" "}
                    <Link
                        to="/signup"
                        onClick={onNavigate}
                        className="font-semibold text-brand transition-colors duration-200 outline-none hover:text-red-700 focus-visible:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        )
    }

    const initial = user.name.trim().charAt(0).toUpperCase() || "U"
    const showAdminLink = user.role !== "customer"

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-xs font-bold uppercase text-white">
                    {initial}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-secondary">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
            </div>

            {showAdminLink && (
                <Link
                    to="/admin"
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-muted/60"
                >
                    <ShieldCheckIcon className="h-4 w-4 shrink-0 text-brand" />
                    Admin panel
                </Link>
            )}

            <Link
                to="/profile"
                onClick={onNavigate}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-muted/60"
            >
                <UserCircleIcon className="h-4 w-4 shrink-0 text-brand" />
                My profile
            </Link>

            <button
                type="button"
                onClick={() => {
                    onNavigate()
                    logout()
                }}
                className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-muted/60"
            >
                <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0 text-brand" />
                Log out
            </button>
        </div>
    )
}

export default SidebarAuth