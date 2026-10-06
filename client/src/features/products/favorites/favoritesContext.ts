import { createContext } from "react"

export interface FavoritesContextValue {
    /** Product ids, in the order they were favourited. */
    favorites: number[]
    count: number
    isFavorite: (id: number) => boolean
    /** Adds if absent, removes if present. */
    toggleFavorite: (id: number) => void
    addFavorite: (id: number) => void
    removeFavorite: (id: number) => void
    /** Empties the list in one request (accounts) or one write (guests). */
    clearFavorites: () => void
    /** True while an account's list is still being fetched or handed over. */
    isLoading: boolean
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)
