interface ButtonProps {
    title: string
}
const Button = ({ title }: ButtonProps) => {
    return (
        <button
            className={`
                flex items-center justify-between gap-1
                px-4 py-3

                text-[10px]
                md:text-[13px]
                lg:text-md

                font-bold uppercase tracking-wide
                transition-colors duration-200
                rounded-lg lg:rounded-xl
                outline-none cursor-pointer
                leading-none
                text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700
            `}
        >
            {title}
        </button>
    )
}

export default Button
