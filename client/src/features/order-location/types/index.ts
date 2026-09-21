import type { StoreLocation } from "../../store-locations/types"

export const ORDER_LOCATION_STORAGE_KEY = "dodz-order-location"
export const MAX_DELIVERY_KM = 10

export type OrderLocationMode = "delivery" | "pickup"

export interface OrderLocation {
    mode: OrderLocationMode
    lat: number
    lng: number
    branchId: number
    branchName: string
    area: string
    address?: string | null
    distanceKm?: number
    selectedAt: string
}

export interface GeoPosition {
    lat: number
    lng: number
}

export type BranchPoint = Pick<StoreLocation, "id" | "name" | "area" | "lat" | "lng">

export interface ServingBranch {
    branch: BranchPoint
    distanceKm: number
    isInZone: boolean
}

export type PickerStatusTone = "neutral" | "success" | "error"

export interface PickerStatus {
    tone: PickerStatusTone
    title: string
    body: string
}