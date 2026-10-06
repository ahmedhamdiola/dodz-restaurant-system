/**
 * A favourited menu item, projected from the live catalogue.
 *
 * Carries the same fields the storefront's AddToCartButton and category links
 * need, so a favourites card can add to the cart and link back to its category
 * without a second fetch.
 */
export interface FavoriteProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    categorySlug: string;
    isCustomizable: boolean;
}
