import { pool } from "../../config/database.js";

// Columns that may be safely exposed to clients; mirrors sanitizeUser in auth.types.ts
const PublicUserColumns = "id, name, email, phone, role, avatar, gender, birthdate, is_email_verified, created_at";

export const AuthRepository = () => {
    // Creates a password-based user (provider = 'email', role = 'customer').
    // Returns null when the email or phone is already taken (Postgres unique violation 23505).
    const createUserWithPassword = async (params: {
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
    }) => {
        try {
            const result = await pool.query(`
                INSERT INTO users (name, email, phone, password_hash, provider, role, is_email_verified)
                VALUES ($1, $2, $3, $4, 'email', 'customer', false)
                RETURNING ${PublicUserColumns}
            `, [params.name, params.email, params.phone, params.passwordHash]);

            return result.rows[0] ?? null;
        } catch (error) {
            if ((error as { code?: string }).code === "23505") {
                return null;
            }
            throw error;
        }
    };

    const getPublicUserByID = async (id: number) => {
        const result = await pool.query(`
            SELECT ${PublicUserColumns}
            FROM users
            WHERE id = $1 AND is_deleted = false
        `, [id]);
        return result.rows[0] ?? null;
    };

    const updateLastLoginAt = async (id: number) => {
        await pool.query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
    };

    return {
        createUserWithPassword,
        getPublicUserByID,
        updateLastLoginAt,
    };
};