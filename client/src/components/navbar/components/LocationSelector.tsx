import { lazy, Suspense, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/16/solid"
import { BuildingStorefrontIcon, MapPinIcon } from "@heroicons/react/24/outline"
import { useOrderType } from "../../../features/order/useOrderType"
import { useOrderLocation } from "../../../features/order-location/useOrderLocation"

const LocationPickerModal = lazy(
    () => import("../../../features/order-location/components/LocationPickerModal")
)

const LocationSelector = () => {
    const { isDelivery } = useOrderType()
    const { selection } = useOrderLocation()
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const hasSelection = selection !== null
    const label = isDelivery ? "Deliver to" : "Pick up from"
    const value = !hasSelection
        ? isDelivery
            ? "Select location"
            : "Select branch"
        : isDelivery
          ? selection.area
          : selection.branchName
    const Icon = isDelivery ? MapPinIcon : BuildingStorefrontIcon

    return (
        <>
            <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                aria-label={`${label} ${value}`}
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
                <Icon className={`w-4 md:w-6 shrink-0 ${hasSelection ? "text-brand" : ""}`} />
                <div className="flex min-w-0 flex-col items-start leading-none">
                    <span className="text-[10px] text-muted-foreground">
                        {label}
                    </span>
                    <span className="max-w-[110px] truncate md:text-md font-medium">
                        {value}
                    </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            <Suspense fallback={null}>
                <LocationPickerModal open={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
            </Suspense>
        </>
    )
}

export default LocationSelector