import { XMarkIcon } from "@heroicons/react/24/outline"
import Logo from "../../../assets/logos/Logo.svg"

interface SidebarHeaderProps {
    onClose: () => void
}

const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
    return (
        <div className="flex items-center justify-between h-20 px-5 border-b border-border">
            <img src={Logo} alt="DODZ Logo" className="w-24 brightness-125" />
            <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-secondary active:scale-95 cursor-pointer"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
    )
}

export default SidebarHeader