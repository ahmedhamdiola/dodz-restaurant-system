import { createContext, useContext } from "react";

export interface CartUIContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    /**
     * Bumped after a successful add so the navbar badge can replay its bump
     * animation. Consumers key the badge on it instead of running a timer.
     */
    addedCount: number;
    notifyAdded: () => void;
}

export const CartUIContext = createContext<CartUIContextValue | undefined>(undefined);

export const useCartUI = () => {
    const ctx = useContext(CartUIContext);
    if (!ctx) {
        throw new Error("useCartUI must be used within CartProvider");
    }
    return ctx;
};