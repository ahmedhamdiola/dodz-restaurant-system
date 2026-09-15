interface SeparatorProps {
    className?: string
    cut?: boolean
}
const Separator = ({ className = "", cut = false }: SeparatorProps) => {
    return (
        <div className={`border-b border-primary h-1 ${cut ? 'mx-3' : ''} ` + className} />
    )
}

export default Separator
