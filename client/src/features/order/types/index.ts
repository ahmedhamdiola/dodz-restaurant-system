export const ORDER_TYPES = ["Delivery", "Pickup"] as const
export type OrderType = (typeof ORDER_TYPES)[number]

export const ORDER_TYPE_STORAGE_KEY = "dodz-order-type"