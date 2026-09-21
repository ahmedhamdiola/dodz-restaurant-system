import type { BranchPoint, GeoPosition, ServingBranch } from "../types"

const EARTH_RADIUS_KM = 6371
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export const haversineDistanceKm = (a: GeoPosition, b: GeoPosition): number => {
    const dLat = toRadians(b.lat - a.lat)
    const dLng = toRadians(b.lng - a.lng)

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2

    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export const findServingBranch = (
    point: GeoPosition,
    branches: BranchPoint[],
    maxDistanceKm: number
): ServingBranch | null => {
    if (branches.length === 0) return null

    let nearest = branches[0]
    let nearestDistance = haversineDistanceKm(point, nearest)

    for (const branch of branches.slice(1)) {
        const distance = haversineDistanceKm(point, branch)
        if (distance < nearestDistance) {
            nearest = branch
            nearestDistance = distance
        }
    }

    return {
        branch: nearest,
        distanceKm: nearestDistance,
        isInZone: nearestDistance <= maxDistanceKm,
    }
}