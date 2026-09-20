import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { StoreLocation } from "../types";

interface StoreMapProps {
    location: StoreLocation;
}

const embedUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}&z=15&hl=en&output=embed`;

const openUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}&z=15`;

const StoreMap = ({ location }: StoreMapProps) => {
    return (
        <div className="flex flex-col gap-3 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-md">
                <iframe
                    key={location.id}
                    src={embedUrl(location.lat, location.lng)}
                    title={`Map of ${location.name}`}
                    className="h-[380px] w-full border-0 lg:h-[560px]"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
            <a
                href={openUrl(location.lat, location.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand transition-colors hover:text-brand"
            >
                <ArrowTopRightOnSquareIcon className="w-4" />
                Open in Google Maps
            </a>
        </div>
    );
};

export default StoreMap;