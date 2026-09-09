interface SidebarBackdropProps {
    isOpen: boolean
    onClose: () => void
}

const SidebarBackdrop = ({ isOpen, onClose }: SidebarBackdropProps) => {
    return (
        <div
            aria-hidden="true"
            onClick={onClose}
            className={`
                fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
                transition-opacity duration-300 ease-in-out
                ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
        />
    )
}

export default SidebarBackdrop