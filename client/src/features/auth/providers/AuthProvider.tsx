import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "../authContext";
import { AuthError, authService } from "../services/authService";
import { clearStoredToken, getStoredToken, setStoredToken } from "../../../lib/authStorage";
import { queryClient } from "../../../lib/queryClient";
import type { AuthUser, LoginValues, SignupValues } from "../types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => getStoredToken());
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => Boolean(getStoredToken()));

    // Restore the session on mount: if a token exists, validate it via /auth/me.
    // (No token → nothing to restore; isBootstrapping is already false.)
    useEffect(() => {
        const stored = getStoredToken();
        if (!stored) return;

        let cancelled = false;

        authService
            .fetchMe(stored)
            .then((me) => {
                if (cancelled) return;
                setUser(me);
                setToken(stored);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                // Only a 401 means the stored token is unusable — drop it. (The
                // 401 interceptor also clears storage and redirects to /login.)
                if (err instanceof AuthError && err.status === 401) {
                    clearStoredToken();
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => {
                if (!cancelled) setIsBootstrapping(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (values: LoginValues): Promise<AuthUser> => {
        const { token: newToken, user: newUser } = await authService.login(values);
        setStoredToken(newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    }, []);

    const signup = useCallback(async (values: SignupValues): Promise<AuthUser> => {
        const { token: newToken, user: newUser } = await authService.signup(values);
        setStoredToken(newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    }, []);

    const logout = useCallback(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
        queryClient.clear();
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user),
            isBootstrapping,
            login,
            signup,
            logout,
        }),
        [user, token, isBootstrapping, login, signup, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};