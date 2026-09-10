import SidebarBackdrop from "./components/SidebarBackdrop"
import SidebarHeader from "./components/SidebarHeader"
import SidebarNavLinks from "./components/SidebarNavLinks"
import SidebarFooter from "./components/SidebarFooter"
import { useEscapeKey } from "./hooks/useEscapeKey"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    useEscapeKey(isOpen, onClose)

    return (
        <>
            <SidebarBackdrop isOpen={isOpen} onClose={onClose} />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                inert={!isOpen}
                style={{ translate: isOpen ? "0" : "-100%" }}
                className={`
                    fixed top-0 left-0 z-50 h-dvh w-72 sm:w-80
                    flex flex-col
                    bg-primary text-secondary
                    shadow-2xl shadow-black/50
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "" : "pointer-events-none"}
                `}
            >
                <SidebarHeader onClose={onClose} />
                <SidebarNavLinks onNavigate={onClose} />

                <SidebarFooter />
            </aside>
        </>
    )
}

export default Sidebar
