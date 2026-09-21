import DeliveryIcon from "../../assets/icons/delivery-icon.svg"
import PickupIcon from "../../assets/icons/pickup-icon.svg"
import type { OrderType } from "./types"

export interface OrderTypeOption {
    title: OrderType
    Icon: string
}

export const ORDER_TYPE_OPTIONS: OrderTypeOption[] = [
    { title: "Delivery", Icon: DeliveryIcon },
    { title: "Pickup", Icon: PickupIcon },
]