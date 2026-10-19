export interface GeocodingResult {
    placeId: number
    label: string
    lat: number
    lng: number
}

const GEOCODING_ENDPOINT = "https://nominatim.openstreetmap.org/search"

export const searchPlaces = async (query: string): Promise<GeocodingResult[]> => {
    const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "5",
        countrycodes: "eg",
        accept_language: "ar",
    })
    const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`)
    if (!response.ok) throw new Error("Search failed")

    const data = (await response.json()) as Array<{
        place_id: number
        display_name: string
        lat: string
        lon: string
    }>

    return data.map((item) => ({
        placeId: item.place_id,
        label: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
    }))
}

/**
 * Turns a raw pin drop into a readable address for the checkout field.
 * Returns null when OSM has nothing to say for the point.
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        zoom: "18",
        countrycodes: "eg",
        accept_language: "ar",
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`)
    if (!response.ok) throw new Error("Reverse geocoding failed")

    const data = (await response.json()) as { display_name?: string }
    return data.display_name ?? null
}