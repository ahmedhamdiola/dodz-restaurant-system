import { useCallback, useMemo, type ReactNode } from "react"
import { useLocalStorage } from "../../../hooks/useLocalStorage"
import { STORE_LOCATIONS } from "../../store-locations/data"
import { OrderLocationContext } from "../orderLocationContext"
import { ORDER_LOCATION_STORAGE_KEY, type OrderLocation } from "../types"

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value)

const sanitizeSelection = (value: unknown): OrderLocation | null => {
    if (!isRecord(value)) return null

    const { mode, lat, lng, branchId, branchName, area, distanceKm, address, selectedAt } = value

    if ((mode !== "delivery" && mode !== "pickup") || !isFiniteNumber(branchId)) return null

    const branch = STORE_LOCATIONS.find((item) => item.id === branchId)
    if (!branch) return null

    const base = {
        branchId: branch.id,
        branchName: typeof branchName === "string" ? branchName : branch.name,
        area: typeof area === "string" ? area : branch.area,
        selectedAt: typeof selectedAt === "string" ? selectedAt : new Date().toISOString(),
    }

    if (mode === "delivery") {
        if (
            !isFiniteNumber(lat) ||
            lat < -90 ||
            lat > 90 ||
            !isFiniteNumber(lng) ||
            lng < -180 ||
            lng > 180 ||
            !isFiniteNumber(distanceKm)
        ) {
            return null
        }

        return {
            mode: "delivery",
            lat,
            lng,
            ...base,
            address: typeof address === "string" ? address : null,
            distanceKm,
        }
    }

    return {
        mode: "pickup",
        lat: branch.lat,
        lng: branch.lng,
        ...base,
    }
}

export const OrderLocationProvider = ({ children }: { children: ReactNode }) => {
    const [selection, setSelectionRaw] = useLocalStorage<OrderLocation | null>(
        ORDER_LOCATION_STORAGE_KEY,
        null,
        sanitizeSelection
    )

    const setSelection = useCallback(
        (next: OrderLocation) => setSelectionRaw(next),
        [setSelectionRaw]
    )

    const clear = useCallback(() => setSelectionRaw(null), [setSelectionRaw])

    const value = useMemo(
        () => ({ selection, setSelection, clear }),
        [selection, setSelection, clear]
    )

    return <OrderLocationContext.Provider value={value}>{children}</OrderLocationContext.Provider>
}