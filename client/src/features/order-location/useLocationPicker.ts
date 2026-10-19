import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { STORE_LOCATIONS } from "../store-locations/data"
import type { StoreLocation } from "../store-locations/types"
import { reverseGeocode, searchPlaces, type GeocodingResult } from "./services/geocoding"
import { CAIRO_CENTER, CAIRO_ZOOM, FOCUS_ZOOM } from "./lib/leaflet"
import { findServingBranch } from "./utils/geo"
import {
    MAX_DELIVERY_KM,
    type GeoPosition,
    type OrderLocation,
    type PickerStatus,
} from "./types"

interface UseLocationPickerParams {
    isDelivery: boolean
    initialSelection: OrderLocation | null
    open?: boolean
}

const DELIVERY_INITIAL_STATUS: PickerStatus = {
    tone: "neutral",
    title: "Pick your delivery location",
    body: "Tap the map, search your area, or use your current location.",
}

const PICKUP_INITIAL_STATUS: PickerStatus = {
    tone: "neutral",
    title: "Select your pickup branch",
    body: "Choose one of our branches below or tap a pin on the map.",
}

export const useLocationPicker = ({
    isDelivery,
    initialSelection,
    open = true,
}: UseLocationPickerParams) => {
    const seedMarker = (): GeoPosition | null =>
        initialSelection?.mode === "delivery"
            ? { lat: initialSelection.lat, lng: initialSelection.lng }
            : null
    const seedAddress = (): string | null =>
        initialSelection?.mode === "delivery" ? initialSelection.address ?? null : null
    const seedBranch = (): StoreLocation | null =>
        initialSelection?.mode === "pickup"
            ? STORE_LOCATIONS.find((branch) => branch.id === initialSelection.branchId) ?? null
            : null

    const [marker, setMarker] = useState<GeoPosition | null>(seedMarker)
    const [address, setAddress] = useState<string | null>(seedAddress)
    const [selectedBranch, setSelectedBranch] = useState<StoreLocation | null>(seedBranch)
    const [query, setQuery] = useState(initialSelection?.mode === "delivery" ? initialSelection.address ?? "" : "")
    const [results, setResults] = useState<GeocodingResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [noResults, setNoResults] = useState(false)
    const searchTimeout = useRef<number | null>(null)
    const pickTokenRef = useRef(0)

    // The picker stays mounted while closed, so its state would otherwise go
    // stale against edits made in the form (e.g. a typed address written back to
    // the selection). Re-seed from the current selection whenever it opens.
    const [prevOpen, setPrevOpen] = useState(open)
    if (open !== prevOpen) {
        setPrevOpen(open)
        if (open) {
            setMarker(seedMarker())
            setAddress(seedAddress())
            setSelectedBranch(seedBranch())
            setQuery(initialSelection?.mode === "delivery" ? initialSelection.address ?? "" : "")
            setResults([])
            setIsSearching(false)
            setIsLocating(false)
            setError(null)
            setNoResults(false)
        }
    }

    // Drop pending searches when closed so a late response can't mutate
    // reopened state.
    useEffect(() => {
        if (open) return
        if (searchTimeout.current) {
            window.clearTimeout(searchTimeout.current)
            searchTimeout.current = null
        }
    }, [open])

    useEffect(() => {
        return () => {
            if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
        }
    }, [])

    const serving = useMemo(
        () => (marker ? findServingBranch(marker, STORE_LOCATIONS, MAX_DELIVERY_KM) : null),
        [marker]
    )

    const deliveryStatus: PickerStatus = !marker
        ? DELIVERY_INITIAL_STATUS
        : serving?.isInZone
          ? {
                tone: "success",
                title: "You're in zone!",
                body: `${serving.branch.name} will deliver to you (${serving.distanceKm.toFixed(1)} km).`,
            }
          : {
                tone: "error",
                title: "Out of delivery zone",
                body: `Nearest branch is ${serving?.branch.name ?? "..."} (${(serving?.distanceKm ?? 0).toFixed(1)} km away). Try a spot closer to a DODZ branch.`,
            }

    const pickupStatus: PickerStatus = !selectedBranch
        ? PICKUP_INITIAL_STATUS
        : {
              tone: "success",
              title: "Ready for pickup",
              body: `${selectedBranch.name} • ${selectedBranch.area}`,
          }

    const status = isDelivery ? deliveryStatus : pickupStatus
    const mapCenter: GeoPosition = (isDelivery ? marker : selectedBranch) ?? CAIRO_CENTER
    const mapZoom = (isDelivery ? marker : selectedBranch) ? FOCUS_ZOOM : CAIRO_ZOOM
    const canConfirm = isDelivery ? serving?.isInZone === true : selectedBranch !== null

    const handlePick = useCallback((position: GeoPosition) => {
        const token = ++pickTokenRef.current
        // Fill the field immediately with the serving area so it is never empty
        // when the customer confirms, then upgrade to the full geocoded label
        // once it arrives (dropped if the pin moved on in the meantime).
        const provisional =
            findServingBranch(position, STORE_LOCATIONS, MAX_DELIVERY_KM)?.branch.area ?? null
        setMarker(position)
        setAddress(provisional)
        setResults([])
        setNoResults(false)
        setError(null)

        void reverseGeocode(position.lat, position.lng)
            .then((label) => {
                if (label && pickTokenRef.current === token) setAddress(label)
            })
            .catch(() => {
                // Keep the provisional label; the zone status card already
                // reports anything worth telling the customer.
            })
    }, [])

    const handleSelectBranch = useCallback((branch: StoreLocation) => {
        setSelectedBranch(branch)
    }, [])

    const handleQueryChange = (nextQuery: string) => {
        setQuery(nextQuery)
        setResults([])
        setError(null)
        setNoResults(false)
        if (searchTimeout.current) window.clearTimeout(searchTimeout.current)

        const trimmed = nextQuery.trim()
        if (trimmed.length < 3) return

        searchTimeout.current = window.setTimeout(async () => {
            setIsSearching(true)
            try {
                const places = await searchPlaces(trimmed)
                setResults(places)
                setNoResults(places.length === 0)
            } catch {
                setError("There was an error with the search. Please try again or tap the map to pick your location.")
            } finally {
                setIsSearching(false)
            }
        }, 400)
    }

    const handleSearchSelect = (result: GeocodingResult) => {
        setMarker({ lat: result.lat, lng: result.lng })
        setAddress(result.label)
        setQuery(result.label)
        setResults([])
        setNoResults(false)
        setError(null)
    }

    const handleSearchSubmit = async () => {
        const trimmed = query.trim()
        if (trimmed.length < 3) return

        setError(null)
        if (results.length > 0) {
            handleSearchSelect(results[0])
            return
        }

        try {
            const places = await searchPlaces(trimmed)
            if (places.length > 0) {
                handleSearchSelect(places[0])
            } else {
                setNoResults(true)
            }
        } catch {
            setError("There was an error with the search. Please try again or tap the map to pick your location.")
        }
    }

    const handleUseMyLocation = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation isn't supported on this device.")
            return
        }

        setIsLocating(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                handlePick({ lat: position.coords.latitude, lng: position.coords.longitude })
                setIsLocating(false)
            },
            () => {
                setIsLocating(false)
                setError("Couldn't get your location. Check your permissions or tap the map.")
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleConfirm = (): OrderLocation | null => {
        if (isDelivery) {
            if (!marker || !serving?.isInZone) return null

            return {
                mode: "delivery",
                lat: marker.lat,
                lng: marker.lng,
                address,
                branchId: serving.branch.id,
                branchName: serving.branch.name,
                area: serving.branch.area,
                distanceKm: serving.distanceKm,
                selectedAt: new Date().toISOString(),
            }
        }

        if (!selectedBranch) return null

        return {
            mode: "pickup",
            lat: selectedBranch.lat,
            lng: selectedBranch.lng,
            branchId: selectedBranch.id,
            branchName: selectedBranch.name,
            area: selectedBranch.area,
            selectedAt: new Date().toISOString(),
        }
    }

    return {
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
    }
}