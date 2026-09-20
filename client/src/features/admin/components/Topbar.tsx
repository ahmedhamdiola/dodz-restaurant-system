import { useLocation, NavLink } from "react-router-dom";
import { Bars3Icon, BellIcon, MoonIcon, SparklesIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../../contexts/theme/useTheme";

interface TopbarProps {
    onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/studio": "Studio",
    "/admin/products": "Products",
    "/admin/users": "Users",
    "/admin/orders": "Orders",
    "/admin/branches": "Branches",
    "/admin/settings": "Settings",
};

const PAGE_SUBTITLES: Record<string, string> = {
    "/admin": "A quick look at how your restaurant is doing today.",
    "/admin/studio": "The playground — organize categories and fine-tune every product.",
    "/admin/products": "Manage your menu, stock, and pricing.",
    "/admin/users": "Manage staff and customer accounts.",
    "/admin/orders": "Track and manage every incoming order.",
    "/admin/branches": "Manage branches, hours, and hotlines.",
    "/admin/settings": "Store details, notifications, and account configuration.",
};

const Topbar = ({ onMenuClick }: TopbarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useLocation();
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

                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-lg border border-border bg-card p-2 text-secondary transition-colors duration-200 hover:bg-muted"
                >
                    <BellIcon className="w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-card" />
                </button>

                <div className="hidden items-center gap-3 sm:flex">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold uppercase text-white">
                        ME
                    </span>
                    <div className="hidden flex-col leading-tight lg:flex">
                        <span className="text-sm font-semibold text-secondary">Mostafa El Din</span>
                        <span className="text-[11px] text-muted-foreground">Owner</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;