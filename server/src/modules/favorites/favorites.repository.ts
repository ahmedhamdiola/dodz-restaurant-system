import { pool } from "../../config/database.js";

/**
 * A favourite row is only meaningful while its product is still something a
 * customer can actually reach. Soft-deleted products and modifier ingredients
 * (cheese, sauces — never listed, never bought alone) are therefore filtered on
 * read, which lets a stale row sit harmlessly in the table instead of forcing
 * every write path to clean up after a product edit.
 *
 * Interpolated, so it must be paired with an aliased `products p` join.
 */
const ORDERABLE_PRODUCT = "p.is_deleted = false AND p.is_modifier = false";

export const FavoritesRepository = () => {
    /**
     * Ids in the order the customer favourited them. `created_at` is only
     * second-precision, so product_id breaks ties to keep the order stable
     * across reads — otherwise the grid reshuffles on every refetch.
     */
    const listProductIDs = async (userId: number): Promise<number[]> => {
        const result = await pool.query(
            `SELECT f.product_id
             FROM user_favorites f
             JOIN products p ON p.id = f.product_id
             WHERE f.user_id = $1 AND ${ORDERABLE_PRODUCT}
             ORDER BY f.created_at ASC, f.product_id ASC`,
            [userId]
        );
        return result.rows.map((row) => Number(row.product_id));
    };

    const findOrderableProduct = async (productID: number) => {
        const result = await pool.query(
            `SELECT id FROM products p WHERE p.id = $1 AND ${ORDERABLE_PRODUCT}`,
            [productID]
        );
        return result.rows[0] ?? null;
    };

    /** Idempotent: favouriting something twice leaves a single row. */
    const insertFavorite = async (userId: number, productID: number): Promise<void> => {
        await pool.query(
            `INSERT INTO user_favorites (user_id, product_id) VALUES ($1, $2)
             ON CONFLICT (user_id, product_id) DO NOTHING`,
            [userId, productID]
        );
    };

    /** Idempotent: removing something that was never favourited is a no-op. */
    const deleteFavorite = async (userId: number, productID: number): Promise<void> => {
        await pool.query(`DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2`, [
            userId,
            productID,
        ]);
    };

    const clearFavorites = async (userId: number): Promise<void> => {
        await pool.query(`DELETE FROM user_favorites WHERE user_id = $1`, [userId]);
    };

    /**
     * Bulk insert for the guest -> account handover.
     *
     * Unknown and non-orderable ids are dropped by the JOIN rather than rejected,
     * because the payload is a snapshot of a browser's localStorage: it can name
     * products that were removed while the visitor was away, and losing one
     * favourite is not a reason to lose all of them. Deduplication happens here
     * rather than relying on ON CONFLICT because a single statement carrying the
     * same id twice is ambiguous.
     */
    const mergeFavorites = async (userId: number, productIDs: number[]): Promise<void> => {
        if (productIDs.length === 0) return;

        await pool.query(
            `INSERT INTO user_favorites (user_id, product_id)
             SELECT $1, p.id
             FROM unnest($2::int[]) AS wanted(product_id)
             JOIN products p ON p.id = wanted.product_id
             WHERE ${ORDERABLE_PRODUCT}
             ON CONFLICT (user_id, product_id) DO NOTHING`,
            [userId, productIDs]
        );
    };

    return {
        listProductIDs,
        findOrderableProduct,
        insertFavorite,
        deleteFavorite,
        clearFavorites,
        mergeFavorites,
    };
};
