import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "../../../contexts/theme/useTheme"
import SidebarAuth from "./SidebarAuth"

interface SidebarFooterProps {
    onNavigate: () => void
}

const SidebarFooter = ({ onNavigate }: SidebarFooterProps) => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === "dark"

    return (
        <div className="px-5 pt-5 pb-6 border-t border-border space-y-3">
            <SidebarAuth onNavigate={onNavigate} />
            <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted cursor-pointer"
            >
                {isDark ? (
                    <SunIcon className="w-5 h-5 shrink-0" />
                ) : (
                    <MoonIcon className="w-5 h-5 shrink-0" />
                )}
                {isDark ? "Light mode" : "Dark mode"}
            </button>
        </div>
    )
}

export default SidebarFooter