interface SeparatorProps {
    className?: string
}
const Separator = ({ className = "" }: SeparatorProps) => {
    return (
        <div className={`border-b border-border h-1 mx-3 ` + className} />
    )
}

export default Separator
