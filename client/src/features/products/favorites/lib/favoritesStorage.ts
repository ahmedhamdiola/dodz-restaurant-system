/**
 * Local persistence for favourites.
 *
 * Only the GUEST scope is written. An account's list is owned by the server, so
 * mirroring it back into localStorage would just be a second copy to keep in
 * sync — and it would make a returning user's server-side list look like an
 * unsynced local edit on their next login.
 *
 * Per-account slots from the pre-server build are still *read* (see
 * `readScope`) so an existing customer does not silently lose their favourites
 * on upgrade; the provider hands them over through the merge endpoint once and
 * then clears the slot.
 */

const STORAGE_KEY = "dodz-favorites";
const GUEST_KEY = "guest";

export type FavoritesStore = Record<string, number[]>;

const toIdList = (value: unknown): number[] =>
    Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : [];

export const readStore = (): FavoritesStore => {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        // Migrate the original bare-array format into the guest slot.
        if (Array.isArray(parsed)) {
            return { [GUEST_KEY]: toIdList(parsed) };
        }
        if (parsed && typeof parsed === "object") {
            const store: FavoritesStore = {};
            for (const [key, value] of Object.entries(parsed)) {
                store[key] = toIdList(value);
            }
            return store;
        }
        return {};
    } catch {
        // Malformed JSON, or storage disabled in private mode: start clean
        // rather than take the whole storefront down on a bad key.
        return {};
    }
};

export const readScope = (key: string): number[] => readStore()[key] ?? [];

export const writeScope = (key: string, productIDs: number[]): void => {
    if (typeof window === "undefined") return;
    try {
        // Re-read inside the write so a slot another tab added in the meantime
        // is not clobbered by this one.
        const store = readStore();
        store[key] = productIDs;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Quota exceeded or private mode: the in-memory list still works for
        // this session, it simply will not survive a reload.
    }
};

export const clearScope = (key: string): void => {
    writeScope(key, []);
};

export const GUEST_SCOPE = GUEST_KEY;
