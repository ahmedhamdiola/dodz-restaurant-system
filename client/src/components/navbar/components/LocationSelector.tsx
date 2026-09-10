import { ChevronDownIcon } from "@heroicons/react/16/solid"
import { MapPinIcon } from "@heroicons/react/24/outline"

const LocationSelector = () => {
    return (
        <button
            className="
                flex items-center gap-2
                rounded-lg
                border border-border
                bg-muted/50
                px-1 py-1
                md:px-5 md:py-2
                text-secondary
                backdrop-blur-sm
                transition-all
                hover:bg-muted
                h-fit right-0 top-0 md:right-10 md:top-5 cursor-pointer

            "
        >
            <MapPinIcon className="w-4 md:w-6 shrink-0" />
            <div className="flex min-w-0 flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground">
                    Deliver to
                </span>
                <span className="max-w-[110px] truncate md:text-md font-medium">
                    Select location
                </span>
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
    )
}

export default LocationSelector