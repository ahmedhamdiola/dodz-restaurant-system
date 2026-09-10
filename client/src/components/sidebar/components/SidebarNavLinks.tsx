import Separator from "../../ui/Separator"
import { NAV_LINKS_WITH_ICONS, NAV_LINKS_WITHOUT_ICONS } from "../data"

interface SidebarNavLinksProps {
    onNavigate: () => void
}

const SidebarNavLinks = ({ onNavigate }: SidebarNavLinksProps) => {
    return (
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-6">
            <ul className="space-y-1">
                {NAV_LINKS_WITH_ICONS.map((link) => (
                    <li key={link.label}>
                        <a
                            href={link.href}
                            onClick={onNavigate}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-secondary transition-all duration-200 hover:bg-brand/10 hover:text-secondary hover:pl-6 w-full">
                            {link.Icon && (
                                <div className="shrink-0">
                                    <link.Icon className="w-5 h-5 text-secondary" />
                                </div>
                            )}
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
            <Separator className="mt-5" />
            <ul>
                {NAV_LINKS_WITHOUT_ICONS.map((link) => (
                    <li key={link.label}>
                        <a
                            href={link.href}
                            onClick={onNavigate}
                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-brand/10 hover:text-secondary hover:pl-6 w-full"
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default SidebarNavLinks