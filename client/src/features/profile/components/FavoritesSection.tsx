import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "../../../lib/format";
import { AddToCartButton } from "../../cart/components/AddToCartButton";
import type { FavoriteProduct } from "../../products/favorites/types";
import SectionHeading from "./SectionHeading";

interface FavoritesSectionProps {
    products: FavoriteProduct[];
    onRemoveFavorite: (id: number) => void;
    /** Empty copy is tuned to each surface: the page invites, the profile nudges. */
    isLoading?: boolean;
}

/**
 * The favourites grid, shared by /favorites and the profile page.
 *
 * Each card is actionable on both axes — link through to the product's category
 * and add it to the cart — because a list you can only *remove* things from is
 * a reading list, not a shortcut to ordering.
 */
const FavoritesSection = ({ products, onRemoveFavorite, isLoading = false }: FavoritesSectionProps) => {
    if (products.length === 0) {
        return (
            <section className="flex flex-col gap-4">
                <SectionHeading title="Favorites" countLabel="0 items" />
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <HeartIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="max-w-xs text-sm text-muted-foreground">
                        {isLoading
                            ? "Loading your favorites…"
                            : "No favorites yet. Tap the heart on any menu item and it will show up here."}
                    </p>
                    {!isLoading && (
                        <Link
                            to="/menu"
                            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            Browse the menu
                        </Link>
                    )}
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
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                    >
                        <Link
                            to={`/menu/${product.categorySlug}`}
                            className="aspect-[4/3] w-full overflow-hidden bg-muted"
                            aria-label={`View ${product.name}`}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                        <button
                            type="button"
                            onClick={() => onRemoveFavorite(product.id)}
                            aria-label={`Remove ${product.name} from favorites`}
                            title="Remove from favorites"
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand/60"
                        >
                            <HeartIconSolid className="h-4 w-4" />
                        </button>
                        <div className="flex flex-1 flex-col p-3">
                            <Link to={`/menu/${product.categorySlug}`} className="outline-none">
                                <h3 className="truncate text-sm font-semibold text-secondary transition-colors hover:text-brand focus-visible:text-brand">
                                    {product.name}
                                </h3>
                            </Link>
                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                <p className="text-sm font-bold text-brand">{formatPrice(product.price)}</p>
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default FavoritesSection;
