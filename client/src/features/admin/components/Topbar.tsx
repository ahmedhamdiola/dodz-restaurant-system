import { useLocation, NavLink } from "react-router-dom";
import { Bars3Icon, BellIcon, MoonIcon, SparklesIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../../contexts/theme/useTheme";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePendingAlertCount } from "../hooks/useAdminAlerts";

interface TopbarProps {
    onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/alerts": "Branch Alerts",
    "/admin/studio": "Studio",
    "/admin/products": "Products",
    "/admin/users": "Users",
    "/admin/orders": "Orders",
    "/admin/branches": "Branches",
    "/admin/settings": "Settings",
};

const PAGE_SUBTITLES: Record<string, string> = {
    "/admin": "A quick look at how your restaurant is doing today.",
    "/admin/alerts": "Requests and notes coming in from the branches.",
    "/admin/studio": "The playground — organize categories and fine-tune every product.",
    "/admin/products": "Manage your menu, stock, and pricing.",
    "/admin/users": "Manage staff and customer accounts.",
    "/admin/orders": "Track and manage every incoming order.",
    "/admin/branches": "Manage branches, hours, and hotlines.",
    "/admin/settings": "Store details, notifications, and account configuration.",
};

const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    staff: "Staff",
    branch_admin: "Branch admin",
    customer: "Customer",
};

const initialsOf = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

const Topbar = ({ onMenuClick }: TopbarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useLocation();
    const { data: pendingAlerts = 0 } = usePendingAlertCount();
    const { user } = useAuth();
    const title = PAGE_TITLES[pathname] ?? "Dashboard";
    const subtitle = PAGE_SUBTITLES[pathname] ?? PAGE_SUBTITLES["/admin"];

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={onMenuClick}
                    className="-ml-1 rounded-lg p-2 text-secondary transition-colors duration-200 hover:bg-muted lg:hidden"
                >
                    <Bars3Icon className="w-6" />
                </button>

                <div className="flex min-w-0 flex-1 flex-col">
                    <h1 className="truncate text-base font-bold uppercase tracking-tight text-secondary sm:text-lg">
                        {title}
                    </h1>
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">
                        {subtitle}
                    </p>
                </div>

                <NavLink
                    to="/admin/studio"
                    className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-red-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-red-900/30 hover:brightness-110 sm:text-sm"
                >
                    <SparklesIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="hidden sm:inline">Studio</span>
                </NavLink>

                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="rounded-lg border border-border bg-card p-2 text-secondary transition-colors duration-200 hover:bg-muted"
                >
                    {theme === "dark" ? (
                        <SunIcon className="w-5" />
                    ) : (
                        <MoonIcon className="w-5" />
                    )}
                </button>

                <NavLink
                    to="/admin/alerts"
                    aria-label={`Alerts${pendingAlerts > 0 ? ` (${pendingAlerts} pending)` : ""}`}
                    className="relative rounded-lg border border-border bg-card p-2 text-secondary transition-colors duration-200 hover:bg-muted"
                >
                    <BellIcon className="w-5" />
                    {pendingAlerts > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-card">
                            {pendingAlerts > 99 ? "99+" : pendingAlerts}
                        </span>
                    )}
                </NavLink>

                {user && (
                    <div className="hidden items-center gap-3 sm:flex">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold uppercase text-white">
                            {initialsOf(user.name) || "U"}
                        </span>
                        <div className="hidden flex-col leading-tight lg:flex">
                            <span className="text-sm font-semibold text-secondary">{user.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                                {ROLE_LABELS[user.role] ?? user.role}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Topbar;