import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { favoritesService } from "../services/favoritesService";
import { GUEST_SCOPE, clearScope, readScope, writeScope } from "../lib/favoritesStorage";
import { FavoritesContext } from "../favoritesContext";
import type { FavoritesContextValue } from "../favoritesContext";

/**
 * Favourites are account-scoped, with an anonymous fallback.
 *
 * A signed-in customer's list lives on the server so it follows them across
 * devices. Until then — and for logged-out visitors — it lives in localStorage.
 * When someone signs in, whatever the browser is holding is handed over via
 * POST /favorites/merge, exactly as the guest cart is merged into the account,
 * so favouriting something before signup does not throw the list away.
 *
 * Two sources, never two truths: the account list is server state and is only
 * ever replaced wholesale by a server response, while the guest list is local
 * storage read straight through. `favorites` picks between them from the current
 * identity rather than copying one into the other on every auth transition.
 *
 * There is deliberately no react-query cache here. `isFavorite` has to answer
 * synchronously during ProductCard's render, and every mutation already comes
 * back as the caller's full list, so there is nothing to reconcile and no cache
 * that could drift from the server.
 */
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated, isBootstrapping } = useAuth();

    const [serverIDs, setServerIDs] = useState<number[]>([]);
    const [guestIDs, setGuestIDs] = useState<number[]>(() => readScope(GUEST_SCOPE));
    /** Identity whose list `serverIDs` currently holds, or null before the first load. */
    const [loadedFor, setLoadedFor] = useState<string | null>(null);

    // Guards the fetch-and-handover below. A ref (not state) because it is a
    // bookkeeping flag, not something to render, and because writing it must not
    // itself schedule a render. Reset whenever the session ends so a later login
    // by the same person re-runs the handover and picks up anything they
    // favourited as a guest in between.
    const syncedKey = useRef<string | null>(null);

    const accountKey = isAuthenticated && user?.id != null ? `u${user.id}` : null;

    useEffect(() => {
        if (isBootstrapping || accountKey === null) {
            syncedKey.current = null;
            return;
        }
        if (syncedKey.current === accountKey) return;
        syncedKey.current = accountKey;

        const userID = user!.id;
        // Two sources can hold work for this account: the anonymous visitor's
        // list, and — for someone upgrading from the localStorage-only build — a
        // slot keyed by their own user id.
        const pending = [...readScope(GUEST_SCOPE), ...readScope(String(userID))];

        let cancelled = false;

        const run = async () => {
            try {
                const view =
                    pending.length > 0
                        ? await favoritesService.merge(pending)
                        : await favoritesService.get();
                if (cancelled) return;
                // Only cleared once the server has confirmed it owns them, so a
                // failed handover can still be retried on the next visit.
                if (pending.length > 0) {
                    clearScope(GUEST_SCOPE);
                    clearScope(String(userID));
                }
                setServerIDs(view.productIDs);
            } catch {
                // Offline, or signed out mid-flight. Keep whatever the browser
                // holds rather than blanking a list the customer can see they had.
                if (!cancelled) setServerIDs(readScope(GUEST_SCOPE));
            } finally {
                if (!cancelled) setLoadedFor(accountKey);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
        // `user` is intentionally not a dependency: `accountKey` already encodes
        // the identity, and including the object would refetch on every re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountKey, isBootstrapping]);

    const favorites = accountKey === null ? guestIDs : serverIDs;
    const isLoading = accountKey !== null && loadedFor !== accountKey;

    const commitGuest = useCallback((next: number[]) => {
        writeScope(GUEST_SCOPE, next);
        setGuestIDs(next);
    }, []);

    const addFavorite = useCallback(
        (id: number) => {
            if (favorites.includes(id)) return;
            const next = [...favorites, id];
            if (accountKey === null) {
                commitGuest(next);
                return;
            }
            // Optimistic, then reconciled: the heart flips instantly and adopts
            // the server's list, which also carries anything another device added.
            setServerIDs(next);
            favoritesService
                .add(id)
                .then((view) => setServerIDs(view.productIDs))
                .catch(() => setServerIDs(next));
        },
        [favorites, accountKey, commitGuest]
    );

    const removeFavorite = useCallback(
        (id: number) => {
            if (!favorites.includes(id)) return;
            const next = favorites.filter((favorite) => favorite !== id);
            if (accountKey === null) {
                commitGuest(next);
                return;
            }
            setServerIDs(next);
            favoritesService
                .remove(id)
                .then((view) => setServerIDs(view.productIDs))
                .catch(() => setServerIDs(next));
        },
        [favorites, accountKey, commitGuest]
    );

    const clearFavorites = useCallback(() => {
        if (accountKey === null) {
            commitGuest([]);
            return;
        }
        setServerIDs([]);
        favoritesService
            .clear()
            .then((view) => setServerIDs(view.productIDs))
            .catch(() => setServerIDs([]));
    }, [accountKey, commitGuest]);

    const toggleFavorite = useCallback(
        (id: number) => {
            if (favorites.includes(id)) {
                removeFavorite(id);
            } else {
                addFavorite(id);
            }
        },
        [favorites, addFavorite, removeFavorite]
    );

    const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

    const value = useMemo<FavoritesContextValue>(
        () => ({
            favorites,
            count: favorites.length,
            isFavorite,
            toggleFavorite,
            addFavorite,
            removeFavorite,
            clearFavorites,
            isLoading,
        }),
        [favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite, clearFavorites, isLoading]
    );

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
