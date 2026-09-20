import { MapPinIcon, PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { StoreLocation } from "../types";

interface StoreLocationsListProps {
    locations: StoreLocation[];
    selectedId: number;
    onSelect: (id: number) => void;
}

const directionsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const StoreLocationsList = ({ locations, selectedId, onSelect }: StoreLocationsListProps) => {
    return (
        <div className="flex flex-col gap-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-2 scrollbar-slim">
            {locations.map((location) => {
                const isSelected = location.id === selectedId;
                return (
                    <article
                        key={location.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(location.id)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onSelect(location.id);
                            }
                        }}
                        aria-pressed={isSelected}
                        className={`
                            flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-4 shadow-md transition-all duration-200
                            hover:-translate-y-0.5 hover:shadow-lg
                            ${isSelected ? "border-brand ring-2 ring-brand/40" : "border-border"}
                        `}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-bold uppercase tracking-tight text-secondary">
                                {location.name}
                            </h2>
                            <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                                {location.area}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <p className="flex items-start gap-2">
                                <MapPinIcon className="mt-0.5 w-4 shrink-0 text-brand" />
                                <span className="text-secondary/80">{location.address}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <ClockIcon className="w-4 shrink-0 text-brand" />
                                <span>{location.hours}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <PhoneIcon className="w-4 shrink-0 text-brand" />
                                <span dir="ltr">{location.phone}</span>
                            </p>
                        </div>

                        <a
                            href={directionsUrl(location.lat, location.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="w-fit rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                        >
                            Get Directions
                        </a>
                    </article>
                );
            })}
        </div>
    );
};

export default StoreLocationsList;