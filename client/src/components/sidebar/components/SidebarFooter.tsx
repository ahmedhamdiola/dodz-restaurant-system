import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "../../../contexts/theme/useTheme"

const SidebarFooter = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === "dark"

    return (
        <div className="px-5 pt-5 pb-6 border-t border-border space-y-3">
            <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700 transition-colors duration-200 hover:from-red-700 hover:via-red-600 hover:to-red-800 cursor-pointer"
            >
                Login
            </button>
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