import { pool } from "../../config/database.js";
export const CategoryRepository = () => {
    const getAllCategories = async () => {
        const result = await pool.query(`SELECT * FROM categories WHERE is_deleted = false ORDER BY name`);
        return result.rows;
    }

    const getCategoryByID = async (id: number) => {
        const result = await pool.query(`SELECT * FROM categories WHERE id = $1 AND is_deleted = false`, [id]);
        return result.rows[0] ?? null;
    }

    const getCategoryBySlug = async (slug: string) => {
        const result = await pool.query(`SELECT * FROM categories WHERE slug = $1 AND is_deleted = false`, [slug]);
        return result.rows[0] ?? null;
    }

    return {
        getAllCategories,
        getCategoryByID,
        getCategoryBySlug,
    };
};