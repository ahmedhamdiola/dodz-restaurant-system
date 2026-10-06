import type { ComponentType, SVGProps } from "react";
import { BookOpenIcon, BuildingStorefrontIcon, HeartIcon } from "@heroicons/react/24/outline"

/** Heroicons ship as forwardRef components rendering an <svg>. */
type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface NavLink {
    Icon?: NavIcon
    label: string
    /** react-router path — rendered through <Link>, so navigation stays client-side. */
    href: string
}

export const NAV_LINKS_WITH_ICONS: NavLink[] = [
    { Icon: BookOpenIcon, label: "Explore Menu", href: "/menu" },
    { Icon: BuildingStorefrontIcon, label: "Store Locations", href: "/store-locations" },
    { Icon: HeartIcon, label: "Favourites", href: "/favorites" },
]

export const NAV_LINKS_WITHOUT_ICONS: NavLink[] = [
    { label: "Contact Us", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
]
