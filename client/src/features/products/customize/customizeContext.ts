import { createContext, useContext } from "react";
import type { CustomizeTarget } from "./types";

export interface CustomizeUIContextValue {
    /** The product the modal is bound to; kept after close so it can animate out. */
    product: CustomizeTarget | null;
    isOpen: boolean;
    open: (product: CustomizeTarget) => void;
    close: () => void;
}

export const CustomizeUIContext = createContext<CustomizeUIContextValue | undefined>(undefined);

export const useCustomizeUI = () => {
    const ctx = useContext(CustomizeUIContext);
    if (!ctx) {
        throw new Error("useCustomizeUI must be used within CustomizeProvider");
    }
    return ctx;
};
