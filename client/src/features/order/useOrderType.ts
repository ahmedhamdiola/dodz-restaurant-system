import { useContext } from "react"
import { OrderTypeContext } from "./orderTypeContext"

export const useOrderType = () => {
    const ctx = useContext(OrderTypeContext)
    if (!ctx) throw new Error("useOrderType must be used within OrderTypeProvider")
    return ctx
}