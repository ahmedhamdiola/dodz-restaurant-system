import { Link, useLocation } from "react-router-dom"
import Separator from "../../ui/Separator"
import { NAV_LINKS_WITH_ICONS, NAV_LINKS_WITHOUT_ICONS } from "../data"

interface SidebarNavLinksProps {
    onNavigate: () => void
}

const isActive = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

/**
 * These used to be plain <a href> tags, which threw away the SPA on every tap
 * and re-ran the whole boot sequence (token validation, menu fetch, cart sync)
 * just to change page. <Link> keeps navigation client-side, and the active
 * highlight is what tells the customer which drawer item they are already on.
 */
const SidebarNavLinks = ({ onNavigate }: SidebarNavLinksProps) => {
    const { pathname } = useLocation()

    return (
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-6">
            <ul className="space-y-1">
                {NAV_LINKS_WITH_ICONS.map((link) => (
                    <li key={link.label}>
                        <Link
                            to={link.href}
                            onClick={onNavigate}
                            aria-current={isActive(pathname, link.href) ? "page" : undefined}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-brand/10 hover:text-secondary hover:pl-6 w-full ${isActive(pathname, link.href) ? "text-brand bg-brand/10" : "text-secondary"}`}>
                            {link.Icon && (
                                <div className="shrink-0">
                                    <link.Icon className="w-5 h-5 text-secondary" />
                                </div>
                            )}
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
            <Separator className="mt-5" />
            <ul>
                {NAV_LINKS_WITHOUT_ICONS.map((link) => (
                    <li key={link.label}>
                        <Link
                            to={link.href}
                            onClick={onNavigate}
                            aria-current={isActive(pathname, link.href) ? "page" : undefined}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-brand/10 hover:text-secondary hover:pl-6 w-full ${isActive(pathname, link.href) ? "text-brand bg-brand/10" : "text-muted-foreground"}`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default SidebarNavLinks
