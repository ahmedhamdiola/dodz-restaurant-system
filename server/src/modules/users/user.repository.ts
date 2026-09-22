import { pool } from "../../config/database.js";
import { UserInterfaceWithoutID } from "./user.types.js";

// SQL snippet reused so password_hash is never selected for public reads
const PublicUserColumns = "id, name, email, phone, provider, provider_id, role, avatar, gender, birthdate, is_email_verified, is_phone_verified, is_active, last_login_at, is_deleted, created_at, updated_at";

export const UserRepository = () => {
    const getUserByID = async (id: number) => {
        const result = await pool.query(`SELECT ${PublicUserColumns} FROM users WHERE id = $1 AND is_deleted = false`, [id]);
        return result.rows[0] ?? null;
    }

    const getUserByEmail = async (email: string) => {
        const result = await pool.query(`SELECT ${PublicUserColumns} FROM users WHERE email = $1 AND is_deleted = false`, [email]);
        return result.rows[0] ?? null;
    }

    const getUserByPhone = async (phone: string) => {
        const result = await pool.query(`SELECT ${PublicUserColumns} FROM users WHERE phone = $1 AND is_deleted = false`, [phone]);
        return result.rows[0] ?? null;
    }

    // Only used by future auth (login/oauth linking); this is the sole method exposing password_hash
    const getUserByEmailWithPassword = async (email: string) => {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1 AND is_deleted = false`, [email]);
        return result.rows[0] ?? null;
    }

    // Used by social login later to link an account by its provider credentials
    const getUserByProvider = async (provider: string, providerID: string) => {
        const result = await pool.query(`SELECT ${PublicUserColumns} FROM users WHERE provider = $1 AND provider_id = $2 AND is_deleted = false`, [provider, providerID]);
        return result.rows[0] ?? null;
    }

    const getUsers = async (limit: number, offset: number) => {
        const result = await pool.query(`SELECT ${PublicUserColumns} FROM users WHERE is_deleted = false ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        return result.rows;
    }

    const createUser = async (user: UserInterfaceWithoutID) => {
        const result = await pool.query(`
            INSERT INTO users (name, email, phone, provider, provider_id, role, avatar, gender, birthdate, is_email_verified, is_phone_verified, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING ${PublicUserColumns}
        `, [
            user.name,
            user.email,
            user.phone,
            user.provider,
            user.providerID,
            user.role,
            user.avatar,
            user.gender,
            user.birthdate,
            user.isEmailVerified,
            user.isPhoneVerified,
            user.isActive,
        ]);
        return result.rows[0] ?? null;
    }

    const updateUser = async (id: number, user: UserInterfaceWithoutID) => {
        const oldUser = await getUserByID(id);
        if (!oldUser) {
            return null;
        }
        const result = await pool.query(`
            UPDATE users
            SET name = $1, email = $2, phone = $3, provider = $4, provider_id = $5, role = $6, avatar = $7, gender = $8, birthdate = $9,
                is_email_verified = $10, is_phone_verified = $11, is_active = $12, updated_at = CURRENT_TIMESTAMP
            WHERE id = $13 AND is_deleted = false
            RETURNING ${PublicUserColumns}
        `, [
            user.name ?? oldUser.name,
            user.email ?? oldUser.email,
            user.phone ?? oldUser.phone,
            user.provider ?? oldUser.provider,
            user.providerID ?? oldUser.providerID,
            user.role ?? oldUser.role,
            user.avatar ?? oldUser.avatar,
            user.gender ?? oldUser.gender,
            user.birthdate ?? oldUser.birthdate,
            user.isEmailVerified ?? oldUser.isEmailVerified,
            user.isPhoneVerified ?? oldUser.isPhoneVerified,
            user.isActive ?? oldUser.isActive,
            id
        ]);

        return result.rows[0] ?? null;
    }

    const deleteUser = async (id: number) => {
        const result = await pool.query(`
            UPDATE users
            SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_deleted = false
            RETURNING id
        `, [id]);

        return result.rows[0] ?? null;
    }

    return {
        getUserByID,
        getUserByEmail,
        getUserByPhone,
        getUserByEmailWithPassword,
        getUserByProvider,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
    };
};