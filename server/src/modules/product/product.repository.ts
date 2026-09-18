import { pool } from "../../config/database.js";
import { ProductInterfaceWithoutID } from "./product.types.js";
export const ProductRepository = () => {
    const getProductsByCategoryID = async (id: number) => {
        const result = await pool.query(`SELECT * FROM products WHERE category_id = $1`, [id]);
        return result.rows;
    }

    const getProductByID = async (id: number) => {
        const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
        return result.rows[0];
    }

    const getTopDealsProducts = async () => {
        const result = await pool.query(`SELECT * FROM products WHERE is_available = true AND is_deleted = false ORDER BY sold_amount DESC LIMIT 3`);
        return result.rows;
    }

    const createProduct = async (product: ProductInterfaceWithoutID) => {
        const result = await pool.query(`INSERT INTO products (category_id, name, description, price, image, is_available, is_customizable, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            product.categoryID,
            product.name,
            product.description,
            product.price,
            product.image,
            product.isAvailable,
            product.isCustomizable,
            product.isDeleted
        ]);
        return result.rowCount;
    }

    const updateProduct = async (id: number, product: ProductInterfaceWithoutID) => {
        const oldProduct = await getProductByID(id);
        if (!oldProduct) {
            return null;
        }
        const result = await pool.query(`UPDATE products SET name = $1, description = $2, price = $3, image = $4, is_available = $5, is_customizable = $6, is_deleted = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8`, [
            product.name ?? oldProduct.name,
            product.description ?? oldProduct.description,
            product.price ?? oldProduct.price,
            product.image ?? oldProduct.image,
            product.isAvailable ?? oldProduct.isAvailable,
            product.isCustomizable ?? oldProduct.isCustomizable,
            product.isDeleted ?? oldProduct.isDeleted,
            id
        ]);
        return result.rowCount;
    }


    const deleteProduct = async (id: number) => {
        const result = await pool.query(`UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`, [id]);
        return result.rowCount;
    }
    return {
        getProductsByCategoryID,
        getTopDealsProducts,
        getProductByID,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};