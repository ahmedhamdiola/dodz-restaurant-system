import { createContext, useContext } from "react";

export interface CartUIContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const CartUIContext = createContext<CartUIContextValue | undefined>(undefined);

export const useCartUI = () => {
    const ctx = useContext(CartUIContext);
    if (!ctx) {
        throw new Error("useCartUI must be used within CartProvider");
    }
    return ctx;
};