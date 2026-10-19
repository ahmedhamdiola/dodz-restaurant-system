import { pool } from "../../config/database.js";
import { ProductInterfaceWithoutID } from "./product.types.js";

const PRODUCT_SELECT = `
    SELECT p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
           p.name, p.description, p.price, p.image, p.is_available, p.is_customizable,
           p.is_modifier, p.sold_amount, p.created_at, p.updated_at
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE p.is_deleted = false AND c.is_deleted = false
`;

// Storefront visibility rules:
//   is_available = false -> sold out at the branch
//   is_modifier  = true  -> an ingredient (cheese, sauce), not a dish. Never
//                           listed and never bought on its own.
// Admin callers pass includeUnavailable = true to see both.
const STOREFRONT_FILTER = " AND p.is_available = true AND p.is_modifier = false";

export const ProductRepository = () => {
    const getProductsByCategoryID = async (id: number, includeUnavailable = false) => {
        const result = await pool.query(
            `${PRODUCT_SELECT} AND p.category_id = $1 ${includeUnavailable ? "" : STOREFRONT_FILTER} ORDER BY p.created_at DESC`,
            [id]
        );
        return result.rows;
    }

    const getAllProducts = async (includeUnavailable = false) => {
        const result = await pool.query(
            `${PRODUCT_SELECT}${includeUnavailable ? "" : STOREFRONT_FILTER} ORDER BY c.name, p.name`
        );
        return result.rows;
    }

    /** storefrontOnly hides sold-out and modifier products from the public detail endpoint. */
    const getProductByID = async (id: number, storefrontOnly = false) => {
        const result = await pool.query(
            `${PRODUCT_SELECT}${storefrontOnly ? STOREFRONT_FILTER : ""} AND p.id = $1`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    const getProductByName = async (name: string) => {
        const result = await pool.query(`${PRODUCT_SELECT} AND p.name = $1`, [name]);
        return result.rows[0] ?? null;
    }

    const getTopDealsProducts = async () => {
        const result = await pool.query(`${PRODUCT_SELECT}${STOREFRONT_FILTER} ORDER BY p.sold_amount DESC LIMIT 3`);
        return result.rows;
    }

    const createProduct = async (product: ProductInterfaceWithoutID) => {
        const result = await pool.query(`INSERT INTO products (category_id, name, description, price, image, is_available, is_customizable, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
            product.categoryID,
            product.name,
            product.description,
            product.price,
            product.image,
            product.isAvailable,
            product.isCustomizable,
            product.isDeleted
        ]);
        return result.rows[0] ?? null;
    }

    const updateProduct = async (id: number, product: ProductInterfaceWithoutID) => {
        const oldProduct = await getProductByID(id);
        if (!oldProduct) {
            return null;
        }
        const result = await pool.query(`UPDATE products SET name = $1, description = $2, price = $3, image = $4, is_available = $5, is_customizable = $6, is_deleted = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND is_deleted = false RETURNING *`, [
            product.name ?? oldProduct.name,
            product.description ?? oldProduct.description,
            product.price ?? oldProduct.price,
            product.image ?? oldProduct.image,
            product.isAvailable ?? oldProduct.isAvailable,
            product.isCustomizable ?? oldProduct.isCustomizable,
            product.isDeleted ?? oldProduct.isDeleted,
            id
        ]);

        return result.rows[0] ?? null;
    }

    const deleteProduct = async (id: number) => {
        const result = await pool.query(`
            UPDATE products
            SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_deleted = false
            RETURNING id
        `, [id]);

        return result.rows[0] ?? null;
    }

    // Opening stock rows for a brand-new product across every active branch.
    // Same neutral default as the branch-admins migration backfill; the branch
    // dashboard overwrites it. Safe to call twice (ON CONFLICT).
    const seedBranchStock = async (productId: number) => {
        await pool.query(
            `INSERT INTO branch_stock (branch_id, product_id, quantity, low_stock_threshold)
             SELECT id, $1, 50, 10 FROM branches WHERE is_deleted = false
             ON CONFLICT (branch_id, product_id) DO NOTHING`,
            [productId]
        );
    };

    return {
        getProductsByCategoryID,
        getAllProducts,
        getTopDealsProducts,
        getProductByID,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductByName,
        seedBranchStock,
    };
};