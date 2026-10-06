import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import FavoritesSection from "../../features/profile/components/FavoritesSection";
import { useFavoriteProducts } from "../../features/products/favorites/hooks/useFavoriteProducts";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useToast } from "../../components/toast/context";

/**
 * The customer's saved items, as a page in its own right.
 *
 * Deliberately not behind a login guard: an anonymous visitor's favourites live
 * in localStorage and are handed to their account on sign-in, so gating this
 * would hide a list they demonstrably have. Guests get a nudge to sign in so
 * they know the list will follow them to another device.
 */
const FavoritesPage = () => {
    const { favoriteProducts, removeFavorite, clearFavorites, isLoading } = useFavoriteProducts();
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    const handleClearAll = () => {
        clearFavorites();
        toast.success("Favorites cleared");
    };

    return (
        <>
            <Helmet>
                <title>Your Favorites | DODZ Fried Chicken</title>
                <meta
                    name="description"
                    content="The DODZ dishes you have saved, ready to add to your next order."
                />
            </Helmet>

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-secondary sm:text-3xl">
                            <HeartIcon className="h-7 w-7 text-brand" />
                            Your Favorites
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Everything you have saved, ready to drop into a new order.
                        </p>
                    </div>

                    {favoriteProducts.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Clear all
                        </button>
                    )}
                </div>

                {!isAuthenticated && !isLoading && (
                    <p className="mb-6 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 text-sm text-secondary">
                        <Link to="/login" className="font-semibold text-brand underline">
                            Sign in
                        </Link>{" "}
                        to keep these favorites on every device. They are saved on this browser for now.
                    </p>
                )}

                <FavoritesSection
                    products={favoriteProducts}
                    onRemoveFavorite={removeFavorite}
                    isLoading={isLoading}
                />
            </main>
        </>
    );
};

export default FavoritesPage;
