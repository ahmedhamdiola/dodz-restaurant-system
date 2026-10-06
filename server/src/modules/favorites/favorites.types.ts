/**
 * Every read and every mutation answers with the caller's full list rather than
 * a bare success flag, so the client never has to guess the resulting state and
 * a retry is always safe.
 */
export interface FavoritesView {
    productIDs: number[];
}

/**
 * Hard cap on a single merge request. Guests can only ever accumulate ids the
 * storefront already offered them, but the body is client-controlled so it is
 * bounded before it reaches the database.
 */
export const MAX_FAVORITES = 500;
