import { useLayoutEffect, useState, type ReactNode } from "react"
import { ThemeContext, type Theme } from "../themeContext"

const STORAGE_KEY = "dodz-theme"

const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") return "dark"
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
    return "dark"
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    // Apply the theme class before paint to avoid a flash of the wrong theme
    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        window.localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
