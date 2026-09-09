interface OrderBurttonProps {
    title: string,
    isActive: boolean,
    Icon: string,
    onClick?: () => void
}

const OrderButton = ({ title, isActive, Icon, onClick }: OrderBurttonProps) => {
    return (
        <button
            className={`
                flex items-center justify-between gap-1
                px-3 py-2

                text-[10px]
                md:text-[13px]
                lg:text-xs

                font-bold uppercase tracking-wide
                transition-colors duration-200
                rounded-lg lg:rounded-xl
                outline-none cursor-pointer
                leading-none

                ${isActive
                    ? "text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700"
                    : "bg-neutral-900/10 text-neutral-900/40 dark:bg-gray-700/40 dark:text-white"
                }
            `}
            onClick={onClick}
        >
            <div
                className={`
                    ${isActive ? "bg-white/20 rounded-md" : ""}
                    p-0.5 sm:p-1 md:p-1
                    flex items-center justify-center
                `}
            >
                <img
                    src={Icon}
                    alt="Icon"
                    className={`
                        w-5
                        lg:w-8
                        shrink-0
                        ${!isActive ? "saturate-0 opacity-40" : ""}
                    `}
                />
            </div>
            {title}
        </button>
    )
}
export default OrderButton
