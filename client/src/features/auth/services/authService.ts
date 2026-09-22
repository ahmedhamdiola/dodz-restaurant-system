import { api, unwrap } from "../../../lib/api";
import type { AuthResponse, AuthUser, LoginValues, SignupValues } from "../types";

/** Query keys for auth server-state (used for cache invalidation). */
export const authKeys = {
    me: ["auth", "me"] as const,
};

/** Normalized auth error — an instanceof Error with an optional HTTP status. */
export class AuthError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "AuthError";
        this.status = status;
    }
}

interface ErrorLike {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
}

/** Maps raw axios/network failures to stable, user-facing messages. */
export const normalizeAuthError = (err: unknown): Error => {
    if (err instanceof AuthError) return err;

    const like = err as ErrorLike;
    const status = like.response?.status;
    const backendMessage = like.response?.data?.message;

    let message: string;
    if (!status) {
        message = "Unable to reach the server. Please check your connection and try again.";
    } else if (status === 409) {
        message = "An account with this email already exists.";
    } else if (status === 401 && backendMessage === "Account is disabled") {
        message = "This account has been disabled. Contact support.";
    } else if (backendMessage) {
        message = backendMessage;
    } else {
        message = "Something went wrong, please try again.";
    }
    return new AuthError(message, status);
};

export const isConflictError = (err: unknown): boolean =>
    err instanceof AuthError && err.status === 409;

export const authService = {
    async login({ email, password }: LoginValues): Promise<AuthResponse> {
        try {
            return await unwrap<AuthResponse>(
                api.post("/auth/login", { email, password })
            );
        } catch (err) {
            throw normalizeAuthError(err);
        }
    },

    async signup({ name, email, phone, password }: SignupValues): Promise<AuthResponse> {
        try {
            return await unwrap<AuthResponse>(
                api.post("/auth/signup", { name, email, phone, password })
            );
        } catch (err) {
            throw normalizeAuthError(err);
        }
    },

    async fetchMe(token: string): Promise<AuthUser> {
        try {
            return await unwrap<AuthUser>(
                api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            );
        } catch (err) {
            throw normalizeAuthError(err);
        }
    },
};