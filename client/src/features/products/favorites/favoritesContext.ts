import { createContext } from "react"

export interface FavoritesContextValue {
    favorites: number[]
    isFavorite: (id: number) => boolean
    toggleFavorite: (id: number) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)