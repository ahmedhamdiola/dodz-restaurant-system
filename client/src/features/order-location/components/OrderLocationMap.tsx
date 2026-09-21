import { useEffect, useRef } from "react"
import type { LeafletEventHandlerFnMap } from "leaflet"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"
import { STORE_LOCATIONS } from "../../store-locations/data"
import type { StoreLocation } from "../../store-locations/types"
import { BRANCH_ICON, BRANCH_ICON_ACTIVE, FOCUS_ZOOM, USER_ICON } from "../lib/leaflet"
import "../lib/leaflet"
import type { GeoPosition } from "../types"

interface OrderLocationMapProps {
    isDelivery: boolean
    center: GeoPosition
    zoom: number
    marker: GeoPosition | null
    selectedBranch: StoreLocation | null
    onPick: (position: GeoPosition) => void
    onSelectBranch: (branch: StoreLocation) => void
}

const STORE_BOUNDS: [[number, number], [number, number]] = (() => {
    const lats = STORE_LOCATIONS.map((branch) => branch.lat)
    const lngs = STORE_LOCATIONS.map((branch) => branch.lng)
    return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
    ]
})()

const MapController = ({
    target,
    onPick,
}: {
    target: GeoPosition | null
    onPick?: (position: GeoPosition) => void
}) => {
    const map = useMap()
    const started = useRef(false)
    const lastTarget = useRef<GeoPosition | null>(null)

    const mapEvents: LeafletEventHandlerFnMap = onPick
        ? { click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }) }
        : {}

    useMapEvents(mapEvents)

    useEffect(() => {
        if (!started.current) {
            started.current = true
            if (!target) map.fitBounds(STORE_BOUNDS, { padding: [40, 40] })
            return
        }
        if (!target) return
        if (
            lastTarget.current &&
            lastTarget.current.lat === target.lat &&
            lastTarget.current.lng === target.lng
        )
            return
        lastTarget.current = target
        map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 0.6 })
    }, [map, target])

    return null
}

const OrderLocationMap = ({
    isDelivery,
    center,
    zoom,
    marker,
    selectedBranch,
    onPick,
    onSelectBranch,
}: OrderLocationMapProps) => {
    return (
        <div className="shrink-0 h-[320px] overflow-hidden rounded-lg border border-border sm:h-[380px]">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                className="h-full w-full"
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController
                    target={isDelivery ? marker : selectedBranch}
                    onPick={isDelivery ? onPick : undefined}
                />
                {STORE_LOCATIONS.map((branch) => {
                    const isActive = !isDelivery && selectedBranch?.id === branch.id

                    return (
                        <Marker
                            key={branch.id}
                            position={[branch.lat, branch.lng]}
                            icon={isActive ? BRANCH_ICON_ACTIVE : BRANCH_ICON}
                            eventHandlers={{
                                click: () =>
                                    isDelivery
                                        ? onPick({ lat: branch.lat, lng: branch.lng })
                                        : onSelectBranch(branch),
                            }}
                        />
                    )
                })}
                {isDelivery && marker && (
                    <Marker
                        position={[marker.lat, marker.lng]}
                        icon={USER_ICON}
                        draggable
                        eventHandlers={{
                            dragend: (event) => onPick(event.target.getLatLng() as GeoPosition),
                        }}
                    />
                )}
            </MapContainer>
        </div>
    )
}

export default OrderLocationMap