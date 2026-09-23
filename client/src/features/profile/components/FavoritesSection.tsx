import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "../../../lib/format";
import type { FavoriteProduct } from "../types";
import SectionHeading from "./SectionHeading";

interface FavoritesSectionProps {
    products: FavoriteProduct[];
    onRemoveFavorite: (id: number) => void;
}

const FavoritesSection = ({ products, onRemoveFavorite }: FavoritesSectionProps) => {
    if (products.length === 0) {
        return (
            <section className="flex flex-col gap-4">
                <SectionHeading title="Favorites" countLabel="0 items" />
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <HeartIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="max-w-xs text-sm text-muted-foreground">
                        No favorites yet. Tap the heart on any menu item.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-4">
            <SectionHeading
                title="Favorites"
                countLabel={`${products.length} ${products.length === 1 ? "item" : "items"}`}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <article
                        key={product.id}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                            <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemoveFavorite(product.id)}
                            aria-label={`Remove ${product.name} from favorites`}
                            title="Remove from favorites"
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand/60"
                        >
                            <HeartIconSolid className="h-4 w-4" />
                        </button>
                        <div className="p-3">
                            <h3 className="truncate text-sm font-semibold text-secondary">
                                {product.name}
                            </h3>
                            <p className="mt-1 text-sm font-bold text-brand">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default FavoritesSection;