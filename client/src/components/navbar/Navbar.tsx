import { Bars3Icon } from "@heroicons/react/16/solid"
import Logo from "../../assets/logos/Logo.svg"
import OrderButtons from "./components/OrderButtons"
import LocationSelector from "./components/LocationSelector"
import { CartTrigger } from "../../features/cart/components/CartTrigger"
import { useState } from "react"
import Sidebar from "../sidebar/Sidebar"
import { useScrollLock } from "./hooks/useScrollLock"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
    const [isSidebar, setIsSidebar] = useState(false)
    const navigate = useNavigate()
    useScrollLock(isSidebar)

    return (
        <>
            <nav className="relative z-20 sticky top-0 bg-navbar backdrop-blur-md border-b border-border shadow-lg shadow-black/10 dark:shadow-black/20 select-none">
                <div className="flex items-center justify-between min-h-[80px] px-3 sm:px-5 py-3">
                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            aria-label="Open menu"
                            aria-expanded={isSidebar}
                            onClick={() => setIsSidebar(true)}
                            className="p-2 -ml-2 rounded-lg text-secondary transition-colors duration-200 hover:bg-muted active:scale-95 cursor-pointer"
                        >
                            <Bars3Icon className="w-6 lg:w-8 " />
                        </button>
                        <img
                            src={Logo}
                            alt="DODZ Logo"
                            className="w-24 lg:w-28 cursor-pointer brightness-125"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <LocationSelector />
                        <CartTrigger />
                    </div>
                </div>
                <div className="pb-3 lg:pb-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
                    <OrderButtons />
                </div>
            </nav>
            <Sidebar isOpen={isSidebar} onClose={() => setIsSidebar(false)} />
        </>
    )
}

export default Navbar