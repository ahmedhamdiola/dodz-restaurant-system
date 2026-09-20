import { useState } from "react";
import { Helmet } from "react-helmet-async";
import StoreLocationsList from "../../features/store-locations/components/StoreLocationsList";
import StoreMap from "../../features/store-locations/components/StoreMap";
import { STORE_LOCATIONS } from "../../features/store-locations/data";

const StoreLocationsPage = () => {
    const [selectedId, setSelectedId] = useState(STORE_LOCATIONS[0].id);
    const selectedLocation =
        STORE_LOCATIONS.find((location) => location.id === selectedId) ?? STORE_LOCATIONS[0];

    return (
        <>
            <Helmet>
                <title>Store Locations | DODZ Fried Chicken</title>
                <meta
                    name="description"
                    content="Find the nearest DODZ Fried Chicken branch. Explore our store locations across Cairo with addresses, working hours, and directions."
                />
            </Helmet>
            <div className="bg-primary px-5 py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <header className="flex flex-col items-center gap-2 text-center">
                        <h1 className="border-b-2 border-red-600 pb-1 text-2xl font-bold uppercase tracking-tighter text-secondary sm:text-3xl lg:text-4xl">
                            Store Locations
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                            Find your nearest DODZ branch. Tap a store to see it on the map and get directions.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <StoreLocationsList
                                locations={STORE_LOCATIONS}
                                selectedId={selectedLocation.id}
                                onSelect={setSelectedId}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <StoreMap location={selectedLocation} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StoreLocationsPage;