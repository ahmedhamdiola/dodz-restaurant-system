import { ChevronDownIcon } from "@heroicons/react/16/solid"
import { MapPinIcon } from "@heroicons/react/24/outline"

const LocationSelector = () => {
    return (
        <button
            className="
                flex items-center gap-2
                rounded-lg
                border border-white/15
                bg-white/10
                px-3 py-2
                text-white
                backdrop-blur-sm
                transition-all
                hover:bg-white/15
                h-fit right-0 top-0 md:right-10 md:top-5  cursor-pointer
            "
        >
            <MapPinIcon className="h-4 w-4 shrink-0" />
            <div className="flex min-w-0 flex-col items-start leading-none">
                <span className="text-[10px] text-white/50">
                    Deliver to
                </span>
                <span className="max-w-[110px] truncate text-xs font-medium">
                    Select location
                </span>
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-white/60" />
        </button>
    )
}

export default LocationSelector