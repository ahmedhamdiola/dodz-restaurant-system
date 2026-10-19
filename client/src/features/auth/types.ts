export type AuthMode = "login" | "signup";

export type UserRole = "customer" | "staff" | "admin" | "branch_admin";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    /** Set for branch admins: scopes their dashboard to one branch. */
    branchId: number | null;
    avatar: string | null;
    gender: string | null;
    birthdate: string | null;
    isEmailVerified: boolean;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export interface LoginValues {
    email: string;
    password: string;
}

export interface SignupValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}