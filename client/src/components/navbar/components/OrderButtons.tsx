import OrderButton from "./OrderButton"
import { ORDER_TYPE_OPTIONS } from "../../../features/order/data"
import { useOrderType } from "../../../features/order/useOrderType"

interface OrderButtonsProps {
    className?: string
}

const OrderButtons = ({ className = "" }: OrderButtonsProps) => {
    const { orderType, setOrderType } = useOrderType()

    return (
        <div className={`flex flex-wrap items-center gap-5 lg:ml-5 px-2 lg:px-0 ${className}`}>
            {
                ORDER_TYPE_OPTIONS.map((option) => {
                    return <OrderButton
                        key={option.title}
                        title={option.title}
                        Icon={option.Icon}
                        isActive={orderType === option.title}
                        onClick={() => setOrderType(option.title)} />
                })
            }
        </div>
    )
}

export default OrderButtons