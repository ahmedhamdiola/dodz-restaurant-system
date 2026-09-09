interface SeparatorProps {
    className?: string
}
const Separator = ({ className = "" }: SeparatorProps) => {
    return (
        <div className={`border-b border-black/10 dark:border-white/10 h-1 mx-3 ` + className} />
    )
}

export default Separator
