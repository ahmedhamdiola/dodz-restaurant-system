import { NavLink } from "react-router-dom";
import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    MapPinIcon,
    ShoppingBagIcon,
    TagIcon,
    Squares2X2Icon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import Logo from "../../../assets/logos/Logo.svg";

interface NavItem {
    label: string;
    to: string;
    end?: boolean;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: "/admin", end: true, Icon: Squares2X2Icon },
    { label: "Products", to: "/admin/products", Icon: ShoppingBagIcon },
    { label: "Users", to: "/admin/users", Icon: UsersIcon },
    { label: "Orders", to: "/admin/orders", Icon: ClipboardDocumentListIcon },
    { label: "Branches", to: "/admin/branches", Icon: MapPinIcon },
    { label: "Coupons", to: "/admin/coupons", Icon: TagIcon },
    { label: "Settings", to: "/admin/settings", Icon: Cog6ToothIcon },
];

const NAV_LINK_CLASS_NAME = (isActive: boolean) =>
    `relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
        isActive
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    return (
        <div className="flex h-full w-72 flex-col bg-[#0e1014] text-white">
            <div className="flex items-center gap-3 px-5 pt-6 pb-4">
                <img src={Logo} alt="DODZ Logo" className="w-14 brightness-125" />
                <div className="flex flex-col leading-tight">
                    <span className="text-lg font-bold uppercase tracking-tight">DODZ</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Admin Panel
                    </span>
                </div>
            </div>

            <div className="px-4 pb-2">
                <p className="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Menu
                </p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-2 scrollbar-slim">
                {NAV_ITEMS.map(({ label, to, end, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={({ isActive }) => NAV_LINK_CLASS_NAME(isActive)}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute bottom-2 top-2 left-0 w-1 rounded-full bg-brand" />
                                )}
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
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
                >
                    <ArrowLeftIcon className="h-5 w-5 shrink-0" />
                    Back to website
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;