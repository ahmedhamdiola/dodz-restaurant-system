import { BookOpenIcon, BuildingStorefrontIcon, HeartIcon } from "@heroicons/react/24/outline"
export interface NavLink {
    Icon?: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
        title?: string;
        titleId?: string;
    } & React.RefAttributes<SVGSVGElement>>
    label: string
    href: string
}

export const NAV_LINKS_WITH_ICONS: NavLink[] = [
    { Icon: BookOpenIcon, label: "Explore Menu", href: "/menu" },
    { Icon: BuildingStorefrontIcon, label: "Store Locations", href: "/store-locations" },
    { Icon: HeartIcon, label: "Favourites", href: "/favourites" },
]

export const NAV_LINKS_WITHOUT_ICONS: NavLink[] = [
    { label: "Contact Us", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
]