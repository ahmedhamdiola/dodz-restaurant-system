import OrderButton from "./OrderButton"
import { NAVBAR_ORDER_BUTTONS } from "../../../data"
import { useLocalStorage } from "../../../hooks/useLocalStorage"

interface OrderButtonsProps {
    className?: string
}

const ORDER_TYPES = NAVBAR_ORDER_BUTTONS.map((button) => button.title)

const OrderButtons = ({ className = "" }: OrderButtonsProps) => {
    const [activeOrder, setActiveOrder] = useLocalStorage<string>(
        "dodz-order-type",
        "Delivery",
        (parsed) =>
            typeof parsed === "string" && ORDER_TYPES.includes(parsed) ? parsed : "Delivery"
    )

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
