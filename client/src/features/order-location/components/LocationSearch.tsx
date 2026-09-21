import { ArrowPathIcon, MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline"
import type { GeocodingResult } from "../services/geocoding"

interface LocationSearchProps {
    query: string
    results: GeocodingResult[]
    isLocating: boolean
    onQueryChange: (query: string) => void
    onSelect: (result: GeocodingResult) => void
    onSearchSubmit: () => void
    onUseMyLocation: () => void
}

const LocationSearch = ({
    query,
    results,
    isLocating,
    onQueryChange,
    onSelect,
    onSearchSubmit,
    onUseMyLocation,
}: LocationSearchProps) => {
    return (
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <form
                role="search"
                className="relative flex-1"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSearchSubmit()
                }}
            >
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search your area or street"
                    className="w-full rounded-full border border-border bg-primary pl-9 pr-3 py-2 text-sm text-secondary outline-none transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/30 [&::-webkit-search-cancel-button]:hidden"
                />

                {results.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                        {results.map((result) => (
                            <li key={result.placeId}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(result)}
                                    className="w-full px-4 py-2 text-left text-sm text-secondary transition-colors hover:bg-muted/60 cursor-pointer"
                                >
                                    {result.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </form>

            <button
                type="button"
                onClick={onUseMyLocation}
                disabled={isLocating}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:bg-muted disabled:opacity-60 cursor-pointer"
            >
                {isLocating ? (
                    <ArrowPathIcon className="w-4 animate-spin" />
                ) : (
                    <MapPinIcon className="w-4 text-brand" />
                )}
                Use my location
            </button>
        </div>
    )
}

export default LocationSearch