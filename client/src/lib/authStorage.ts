export const AUTH_TOKEN_KEY = "dodz-auth-token";

export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setStoredToken = (token: string): void => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
        // Storage unavailable (private mode / quota) — the in-memory session still works.
    }
};

export const clearStoredToken = (): void => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
        // no-op
    }
};