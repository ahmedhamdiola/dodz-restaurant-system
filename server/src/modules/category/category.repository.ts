import { pool } from "../../config/database.js";
import { CategoryInput } from "./category.interface.js";

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

    const getCategoryByName = async (name: string) => {
        const result = await pool.query(`SELECT * FROM categories WHERE name = $1 AND is_deleted = false`, [name]);
        return result.rows[0] ?? null;
    }

    const createCategory = async (category: CategoryInput) => {
        const result = await pool.query(`INSERT INTO categories (name, slug, cover_image, icon_image) VALUES ($1, $2, $3, $4) RETURNING *`, [
            category.name,
            category.slug,
            category.coverImage,
            category.iconImage,
        ]);
        return result.rows[0] ?? null;
    }

    const updateCategory = async (id: number, category: CategoryInput) => {
        const result = await pool.query(`UPDATE categories SET name = $1, slug = $2, cover_image = $3, icon_image = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND is_deleted = false RETURNING *`, [
            category.name,
            category.slug,
            category.coverImage,
            category.iconImage,
            id,
        ]);
        return result.rows[0] ?? null;
    }

    const deleteCategory = async (id: number) => {
        const result = await pool.query(`UPDATE categories SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_deleted = false RETURNING id`, [id]);
        return result.rows[0] ?? null;
    }

    return {
        getAllCategories,
        getCategoryByID,
        getCategoryBySlug,
        getCategoryByName,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};