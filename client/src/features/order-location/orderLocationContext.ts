import { createContext } from "react"
import type { OrderLocation } from "./types"

export interface OrderLocationContextValue {
    selection: OrderLocation | null
    setSelection: (selection: OrderLocation) => void
    clear: () => void
}

export const OrderLocationContext = createContext<OrderLocationContextValue | undefined>(undefined)