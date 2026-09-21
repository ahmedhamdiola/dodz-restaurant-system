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