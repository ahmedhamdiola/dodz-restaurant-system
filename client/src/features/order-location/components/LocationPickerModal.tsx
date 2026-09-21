import { useEffect } from "react"
import { createPortal } from "react-dom"
import { InformationCircleIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useScrollLock } from "../../../components/navbar/hooks/useScrollLock"
import { useOrderType } from "../../order/useOrderType"
import { useOrderLocation } from "../useOrderLocation"
import { useLocationPicker } from "../useLocationPicker"
import LocationSearch from "./LocationSearch"
import OrderLocationMap from "./OrderLocationMap"
import PickupBranchGrid from "./PickupBranchGrid"
import PickerStatusCard from "./PickerStatusCard"

interface LocationPickerModalProps {
    open: boolean
    onClose: () => void
}

const LocationPickerModal = ({ open, onClose }: LocationPickerModalProps) => {
    const { isDelivery } = useOrderType()
    const { selection, setSelection } = useOrderLocation()
    const {
        marker,
        selectedBranch,
        query,
        results,
        isSearching,
        isLocating,
        error,
        noResults,
        status,
        mapCenter,
        mapZoom,
        canConfirm,
        handlePick,
        handleSelectBranch,
        handleQueryChange,
        handleSearchSelect,
        handleSearchSubmit,
        handleUseMyLocation,
        handleConfirm,
    } = useLocationPicker({ isDelivery, initialSelection: selection })

    useScrollLock(open)

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, onClose])

    const handleModalConfirm = () => {
        const nextSelection = handleConfirm()
        if (!nextSelection) return

        setSelection(nextSelection)
        onClose()
    }

    if (!open) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <div
                aria-hidden="true"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 text-brand" />
                        <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                            {isDelivery ? "Select delivery location" : "Select pickup branch"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary cursor-pointer"
                    >
                        <XMarkIcon className="w-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto p-4 sm:p-5">
                    {isDelivery && (
                        <>
                            <LocationSearch
                                query={query}
                                results={results}
                                isLocating={isLocating}
                                onQueryChange={handleQueryChange}
                                onSelect={handleSearchSelect}
                                onSearchSubmit={handleSearchSubmit}
                                onUseMyLocation={handleUseMyLocation}
                            />
                            {isSearching && (
                                <p className="text-xs text-muted-foreground">Searching…</p>
                            )}
                            {noResults && (
                                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <InformationCircleIcon className="w-4 shrink-0" />
                                    No places found in Egypt. Try a different area or street name.
                                </p>
                            )}
                        </>
                    )}

                    <OrderLocationMap
                        isDelivery={isDelivery}
                        center={mapCenter}
                        zoom={mapZoom}
                        marker={marker}
                        selectedBranch={selectedBranch}
                        onPick={handlePick}
                        onSelectBranch={handleSelectBranch}
                    />

                    {!isDelivery && (
                        <PickupBranchGrid
                            selectedBranch={selectedBranch}
                            onSelect={handleSelectBranch}
                        />
                    )}

                    <PickerStatusCard status={status} error={isDelivery ? error : null} />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:bg-muted cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleModalConfirm}
                        disabled={!canConfirm}
                        className="rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                        Confirm &amp; Save
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default LocationPickerModal