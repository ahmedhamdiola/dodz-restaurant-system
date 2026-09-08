import { Bars3Icon } from "@heroicons/react/16/solid"
import Logo from "../../assets/logos/Logo.svg"
import OrderButtons from "./components/OrderButtons"
import LocationSelector from "./components/LocationSelector"
import Button from "../ui/Button"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
const Navbar = () => {
    return (
        <nav className="bg-black min-h-[80px] flex justify-between lg:px-5 pb-4 lg:py-2 select-none">
            <div className="flex flex-col lg:flex-row w-full">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-2 items-center w-full lg:w-auto px-5 lg:px-0">
                        <Bars3Icon className="w-6 lg:w-8 text-white shrink-0 cursor-pointer" />
                        <img
                            src={Logo}
                            alt="DODZ Logo"
                            className="w-24 lg:w-28 cursor-pointer brightness-125"
                        />
                    </div>
                    <OrderButtons />
                </div>
            </div>
            <div className="flex gap-3 items-center">
                <LocationSelector />
                <div className="relative">
                    <ShoppingCartIcon className="w-8 text-white cursor-pointer" />
                    <span className="absolute top-0 right-0 text-xs text-white rounded-full bg-red-500 px-1">
                        0
                    </span>
                </div>
                <Button title="Login" />
            </div>
        </nav>
    )
}
export default Navbar
