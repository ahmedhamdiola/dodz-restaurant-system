import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import { FavoritesContext } from "../favoritesContext"

const STORAGE_KEY = "dodz-favorites"

const readStoredFavorites = (): number[] => {
    if (typeof window === "undefined") return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number") : []
    } catch {
        return []
    }
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<number[]>(readStoredFavorites)

    useLayoutEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    }, [favorites])

    const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites])

    const toggleFavorite = useCallback((id: number) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
    }, [])

    const value = useMemo(
        () => ({ favorites, isFavorite, toggleFavorite }),
        [favorites, isFavorite, toggleFavorite]
    )

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}