import { pool } from "../../config/database.js";

export const BranchRepository = () => {
    const getAllBranches = async () => {
        const result = await pool.query(`SELECT * FROM branches WHERE is_deleted = false ORDER BY id`);
        return result.rows;
    };

    const getBranchByID = async (id: number) => {
        const result = await pool.query(`SELECT * FROM branches WHERE id = $1 AND is_deleted = false`, [id]);
        return result.rows[0] ?? null;
    };

    return {
        getAllBranches,
        getBranchByID,
    };
};