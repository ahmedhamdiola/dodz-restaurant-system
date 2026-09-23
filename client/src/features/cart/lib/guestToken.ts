const STORAGE_KEY = "dodz-guest-token";

const readStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const writeStoredToken = (token: string) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
        // Storage unavailable (private mode) — an in-memory identity is still fine
        // for the session, but it won't survive a reload.
    }
};

/**
 * Returns the browser's guest identity for the anonymous cart, creating one on
 * first use (crypto.randomUUID, stored server-side only as a SHA-256 hash).
 */
export const getGuestToken = (): string => {
    const existing = readStoredToken();
    if (existing) return existing;
    const created = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `g_${Date.now()}_${Math.random().toString(36).slice(2, 18)}`;
    writeStoredToken(created);
    return created;
};

/** True when a guest token existed before (used to decide whether to merge). */
export const hasGuestToken = (): boolean => readStoredToken() !== null;

/** Removes the guest identity (after a successful merge into an account). */
export const clearGuestToken = () => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // best effort
    }
};