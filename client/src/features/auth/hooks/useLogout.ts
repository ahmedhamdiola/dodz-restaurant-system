import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Shared logout flow: clears the auth session and returns to the storefront.
 * Used by the profile page and the sidebar account block.
 */
export const useLogout = (): (() => void) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return useCallback(() => {
        logout();
        navigate("/");
    }, [logout, navigate]);
};