import { NavLink, useLocation } from "react-router-dom";
import { ArrowRightOnRectangleIcon, Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../../contexts/theme/useTheme";
import { useAuth } from "../../auth/hooks/useAuth";
import { useLogout } from "../../auth/hooks/useLogout";
import { useBranchInfo } from "../hooks/useBranchInfo";

interface BranchTopbarProps {
    onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
    "/branch": "Stock",
    "/branch/alerts": "Alerts",
};

const PAGE_SUBTITLES: Record<string, string> = {
    "/branch": "Count what is actually on the shelf at your branch today.",
    "/branch/alerts": "Tell the main office what you need, or that you are slammed.",
};

const BranchTopbar = ({ onMenuClick }: BranchTopbarProps) => {
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useLocation();
    const { user } = useAuth();
    const logout = useLogout();

    const { data: branch } = useBranchInfo(user?.branchId);

    const title = PAGE_TITLES[pathname] ?? "Stock";
    const subtitle = PAGE_SUBTITLES[pathname] ?? PAGE_SUBTITLES["/branch"];

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={onMenuClick}
                    className="-ml-1 rounded-lg p-2 text-secondary transition-colors hover:bg-muted lg:hidden"
                >
                    <Bars3Icon className="w-6" />
                </button>

                <div className="flex min-w-0 flex-1 flex-col">
                    <h1 className="truncate text-base font-bold uppercase tracking-tight text-secondary sm:text-lg">
                        {title}
                    </h1>
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
                </div>

                <NavLink
                    to="/branch/alerts"
                    className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-red-900/20 transition-all hover:brightness-110 sm:inline-flex"
                >
                    Report to head office
                </NavLink>

                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="rounded-lg border border-border bg-card p-2 text-secondary transition-colors hover:bg-muted"
                >
                    {theme === "dark" ? <SunIcon className="w-5" /> : <MoonIcon className="w-5" />}
                </button>

                <button
                    type="button"
                    onClick={logout}
                    aria-label="Log out"
                    className="rounded-lg border border-border bg-card p-2 text-secondary transition-colors hover:bg-muted"
                >
                    <ArrowRightOnRectangleIcon className="w-5" />
                </button>

                <div className="hidden items-center gap-3 sm:flex">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold uppercase text-white">
                        {user?.name?.slice(0, 2).toUpperCase() ?? "BA"}
                    </span>
                    <div className="hidden flex-col leading-tight lg:flex">
                        <span className="text-sm font-semibold text-secondary">{user?.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                            {branch ? branch.name : "Branch admin"}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default BranchTopbar;
