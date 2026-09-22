// Roles allowed by the users table CHECK constraint (schema.sql)
export type UserRole = "customer" | "staff" | "admin";

// Shape attached to req.user by the requireAuth middleware
export interface AuthUser {
    id: number;
    role: UserRole;
}

// Public user shape returned to clients — password_hash and internal flags are NEVER included
export interface PublicUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    avatar: string | null;
    gender: string | null;
    birthdate: string | null;
    isEmailVerified: boolean;
    createdAt: string;
}

// snake_case columns selected by the auth repository before sanitizing
export interface PublicUserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    avatar: string | null;
    gender: string | null;
    birthdate: Date | string | null;
    is_email_verified: boolean;
    created_at: Date | string;
}

// Result shapes returned by the auth service
export type SignupResult =
    | { status: "success"; token: string; user: PublicUser }
    | { status: "conflict" };

export type LoginResult =
    | { status: "success"; token: string; user: PublicUser }
    | { status: "invalid_credentials" }
    | { status: "inactive" };

// Maps a raw users row (snake_case DB columns) to the public camelCase client shape.
export const sanitizeUser = (row: PublicUserRow): PublicUser => {
    const formatBirthdate = (value: Date | string | null): string | null => {
        if (!value) {
            return null;
        }
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone ?? null,
        role: row.role,
        avatar: row.avatar ?? null,
        gender: row.gender ?? null,
        birthdate: formatBirthdate(row.birthdate),
        isEmailVerified: Boolean(row.is_email_verified),
        createdAt: new Date(row.created_at).toISOString(),
    };
};