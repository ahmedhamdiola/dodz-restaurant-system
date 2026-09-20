import { useContext } from "react"
import { FavoritesContext } from "./favoritesContext"

export const useFavorites = () => {
    const ctx = useContext(FavoritesContext)
    if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider")
    return ctx
}