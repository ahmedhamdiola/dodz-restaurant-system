import { XMarkIcon } from "@heroicons/react/24/outline"
import Logo from "../../../assets/logos/Logo.svg"

interface SidebarHeaderProps {
    onClose: () => void
}

const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
    return (
        <div className="flex items-center justify-between h-20 px-5 border-b border-black/10 dark:border-white/10">
            <img src={Logo} alt="DODZ Logo" className="w-24 brightness-125" />
            <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-neutral-500 dark:text-white/70 transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white active:scale-95 cursor-pointer"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
    )
}

export default SidebarHeader