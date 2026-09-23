import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { FavoritesContext } from "../favoritesContext";
import { useAuth } from "../../../auth/hooks/useAuth";

const STORAGE_KEY = "dodz-favorites";
const GUEST_KEY = "guest";

const toIdList = (value: unknown): number[] =>
    Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : [];

const readStoredFavorites = (): Record<string, number[]> => {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        // Migrate the legacy bare-array format into the guest slot.
        if (Array.isArray(parsed)) {
            return { [GUEST_KEY]: parsed.filter((id): id is number => typeof id === "number") };
        }
        if (parsed && typeof parsed === "object") {
            const store: Record<string, number[]> = {};
            for (const [key, value] of Object.entries(parsed)) {
                store[key] = toIdList(value);
            }
            return store;
        }
        return {};
    } catch {
        return {};
    }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    // Favorites are scoped per account so a shared device never leaks one
    // user's favorites to another. Anonymous visitors share the guest slot.
    const scopedKey = user?.id != null ? String(user.id) : GUEST_KEY;

    const [favoritesStore, setFavoritesStore] = useState<Record<string, number[]>>(readStoredFavorites);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesStore));
    }, [favoritesStore]);

    const favorites = useMemo(() => favoritesStore[scopedKey] ?? [], [favoritesStore, scopedKey]);

    const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

    const toggleFavorite = useCallback(
        (id: number) => {
            setFavoritesStore((prev) => {
                const current = prev[scopedKey] ?? [];
                return {
                    ...prev,
                    [scopedKey]: current.includes(id)
                        ? current.filter((favorite) => favorite !== id)
                        : [...current, id],
                };
            });
        },
        [scopedKey]
    );

    const value = useMemo(
        () => ({ favorites, isFavorite, toggleFavorite }),
        [favorites, isFavorite, toggleFavorite]
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};