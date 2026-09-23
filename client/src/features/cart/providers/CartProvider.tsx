import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useToast } from "../../../components/toast/context";
import { useAuth } from "../../auth/hooks/useAuth";
import { clearGuestToken, hasGuestToken } from "../lib/guestToken";
import { CartUIContext } from "../cartUIContext";
import { useMergeCart } from "../hooks/useCart";
import { cartApi } from "../redux/cartApi";
import { store } from "../../../app/store";
import { CartDrawer } from "../components/CartDrawer";

/**
 * Cart identity provider. The server cart is the single source of truth (via
 * the Redux Toolkit cart query); this provider:
 *  - owns the drawer open state,
 *  - merges the anonymous guest cart into an account on login/signup,
 *  - resets the guest identity on logout so a shared device never leaks a cart.
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const toast = useToast();
    const mergeCart = useMergeCart();
    const prevUserRef = useRef(user);

    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const prev = prevUserRef.current;
        prevUserRef.current = user;

        if (prev && !user) {
            // Logged out: switch to a fresh guest identity and drop any cached carts.
            clearGuestToken();
            store.dispatch(cartApi.util.resetApiState());
            return;
        }

        if (!prev && user && hasGuestToken()) {
            const guestToken = readExactToken();
            if (!guestToken) return;
            mergeCart.mutate(guestToken, {
                onSuccess: (cart) => {
                    if (cart.item_count > 0) {
                        toast.success("Your guest cart was saved to your account.");
                    }
                    clearGuestToken();
                },
                onError: () => {
                    // Guest cart already consumed or unreachable — move on regardless.
                    clearGuestToken();
                },
            });
        }
    }, [user, mergeCart, toast]);

    const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

    return (
        <CartUIContext.Provider value={value}>
            {children}
            <CartDrawer isOpen={isOpen} onClose={close} />
        </CartUIContext.Provider>
    );
};

const readExactToken = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem("dodz-guest-token");
    } catch {
        return null;
    }
};