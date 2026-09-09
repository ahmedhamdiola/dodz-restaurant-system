import { useState } from "react"
import OrderButton from "./OrderButton"
import { NAVBAR_ORDER_BUTTONS } from "../../../data"

interface OrderButtonsProps {
    className?: string
}

const OrderButtons = ({ className = "" }: OrderButtonsProps) => {
    const [activeOrder, setActiveOrder] = useState("Delivery")
    return (
        <div className={`flex flex-wrap items-center gap-5 lg:ml-5 px-2 lg:px-0 ${className}`}>
            {
                NAVBAR_ORDER_BUTTONS.map((button) => {
                    return <OrderButton
                        key={button.title}
                        title={button.title}
                        Icon={button.Icon}
                        isActive={activeOrder === button.title}
                        onClick={() => setActiveOrder(button.title)} />
                })
            }
        </div>
    )
}

export default OrderButtons
