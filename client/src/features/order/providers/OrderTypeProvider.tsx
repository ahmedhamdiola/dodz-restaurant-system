import { useCallback, useMemo, type ReactNode } from "react"
import { useLocalStorage } from "../../../hooks/useLocalStorage"
import { OrderTypeContext } from "../orderTypeContext"
import { ORDER_TYPES, ORDER_TYPE_STORAGE_KEY, type OrderType } from "../types"

const sanitizeOrderType = (value: unknown): OrderType =>
    typeof value === "string" && ORDER_TYPES.some((type) => type === value)
        ? (value as OrderType)
        : "Delivery"

export const OrderTypeProvider = ({ children }: { children: ReactNode }) => {
    const [orderType, setOrderTypeRaw] = useLocalStorage<OrderType>(
        ORDER_TYPE_STORAGE_KEY,
        "Delivery",
        sanitizeOrderType
    )

    const setOrderType = useCallback(
        (next: OrderType) => setOrderTypeRaw(next),
        [setOrderTypeRaw]
    )

    const value = useMemo(
        () => ({
            orderType,
            setOrderType,
            isDelivery: orderType === "Delivery",
            isPickup: orderType === "Pickup",
        }),
        [orderType, setOrderType]
    )

    return <OrderTypeContext.Provider value={value}>{children}</OrderTypeContext.Provider>
}