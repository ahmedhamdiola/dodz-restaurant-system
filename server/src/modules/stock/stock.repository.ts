import { pool } from "../../config/database.js";
import { BranchStockItem, SetStockInput, type AvailableProductStock } from "./stock.types.js";

export const StockRepository = () => {
    const branchExists = async (branchId: number) => {
        const result = await pool.query(`SELECT id FROM branches WHERE id = $1 AND is_deleted = false`, [branchId]);
        return result.rows.length > 0;
    };

    const productExists = async (productId: number) => {
        const result = await pool.query(
            `SELECT id FROM products WHERE id = $1 AND is_deleted = false AND is_modifier = false`,
            [productId]
        );
        return result.rows.length > 0;
    };

    /**
     * The whole menu for one branch. LEFT JOIN + COALESCE so products that
     * never got a stock row (created outside the seeded path) read as 0 —
     * "not stocked yet" — instead of vanishing from the dashboard.
     */
    const getMenuStock = async (branchId: number): Promise<BranchStockItem[]> => {
        const result = await pool.query(
            `SELECT p.id, p.name, p.description, p.price, p.image,
                    p.is_available,
                    c.name AS category_name, c.slug AS category_slug,
                    COALESCE(bs.quantity, 0) AS quantity,
                    COALESCE(bs.low_stock_threshold, 10) AS low_stock_threshold
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN branch_stock bs ON bs.product_id = p.id AND bs.branch_id = $1
             WHERE p.is_deleted = false
               AND c.is_deleted = false
               AND p.is_modifier = false
             ORDER BY c.name, p.name`,
            [branchId]
        );

        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: Number(row.price),
            image: row.image,
            isAvailable: row.is_available,
            categoryName: row.category_name,
            categorySlug: row.category_slug,
            quantity: row.quantity,
            lowStockThreshold: row.low_stock_threshold,
        }));
    };

    /** The branch's current row for one product, or null when never set. */
    const getStock = async (branchId: number, productId: number) => {
        const result = await pool.query(
            `SELECT quantity, low_stock_threshold
             FROM branch_stock
             WHERE branch_id = $1 AND product_id = $2`,
            [branchId, productId]
        );
        return result.rows[0] ?? null;
    };

    /** Creates or replaces the branch's row for this product. */
    const setStock = async (branchId: number, productId: number, input: Required<SetStockInput>) => {
        const result = await pool.query(
            `INSERT INTO branch_stock (branch_id, product_id, quantity, low_stock_threshold)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (branch_id, product_id)
             DO UPDATE SET quantity = EXCLUDED.quantity,
                           low_stock_threshold = EXCLUDED.low_stock_threshold,
                           updated_at = CURRENT_TIMESTAMP
             RETURNING branch_id, product_id, quantity, low_stock_threshold`,
            [branchId, productId, input.quantity, input.lowStockThreshold]
        );
        return result.rows[0] ?? null;
    };


    const getAvailableStock = async (branchId: number, productIds: number[]): Promise<AvailableProductStock[]> => {
        const result = await pool.query(
            `SELECT p.id AS product_id,
                    COALESCE(bs.quantity, 0) AS quantity,
                    COALESCE(bs.low_stock_threshold, 10) AS low_stock_threshold,
                    p.is_available
             FROM products p
             LEFT JOIN branch_stock bs ON bs.product_id = p.id AND bs.branch_id = $1
             WHERE p.is_deleted = false
               AND p.is_modifier = false
               AND p.id = ANY($2::int[])`,
            [branchId, productIds]
        );
        return result.rows.map((row) => ({
            productId: Number(row.product_id),
            quantity: Number(row.quantity),
            lowStockThreshold: Number(row.low_stock_threshold),
            isAvailable: Boolean(row.is_available),
        }));
    };
    return {
        branchExists,
        productExists,
        getMenuStock,
        getStock,
        setStock,
        getAvailableStock,
    };
};
