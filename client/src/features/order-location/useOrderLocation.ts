import { useContext } from "react"
import { OrderLocationContext } from "./orderLocationContext"

export const useOrderLocation = () => {
    const ctx = useContext(OrderLocationContext)
    if (!ctx) throw new Error("useOrderLocation must be used within OrderLocationProvider")
    return ctx
}