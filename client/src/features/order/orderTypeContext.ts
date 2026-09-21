import { createContext } from "react"
import type { OrderType } from "./types"

export interface OrderTypeContextValue {
    orderType: OrderType
    setOrderType: (orderType: OrderType) => void
    isDelivery: boolean
    isPickup: boolean
}

export const OrderTypeContext = createContext<OrderTypeContextValue | undefined>(undefined)