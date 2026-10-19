import type { ComponentType, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeftIcon, BellAlertIcon, BuildingStorefrontIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { useAuth } from "../../auth/hooks/useAuth";
import { useBranchInfo } from "../hooks/useBranchInfo";

interface NavItem {
    label: string;
    to: string;
    end?: boolean;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Stock", to: "/branch", end: true, Icon: Squares2X2Icon },
    { label: "Alerts", to: "/branch/alerts", Icon: BellAlertIcon },
];

const linkClass = (isActive: boolean) =>
    `relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
        isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

const BranchSidebar = () => {
    const { user } = useAuth();
    const { data: branch } = useBranchInfo(user?.branchId);
    const title = branch?.name ?? "Branch";

    return (
        <div className="flex h-full w-72 flex-col bg-[#0e1014] text-white">
            <div className="flex items-center gap-3 px-5 pt-6 pb-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <BuildingStorefrontIcon className="h-6 w-6" />
                </span>
                <span className="truncate text-lg font-bold uppercase tracking-tight">{title}</span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-2 scrollbar-slim">
                {NAV_ITEMS.map(({ label, to, end, Icon }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
                        {({ isActive }) => (
                            <>
                                {isActive && <span className="absolute bottom-2 top-2 left-0 w-1 rounded-full bg-brand" />}
                                <Icon className="h-5 w-5 shrink-0" />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-white/10 p-4">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 rounded-lg border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white"
                >
                    <ArrowLeftIcon className="h-5 w-5 shrink-0" />
                    Back to website
                </NavLink>
            </div>
        </div>
    );
};

export default BranchSidebar;
