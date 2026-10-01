import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CustomizeUIContext } from "../customizeContext";
import type { CustomizeTarget } from "../types";
import { CustomizeMealModal } from "../components/CustomizeMealModal";

/**
 * Owns which product is being customized. A single modal instance is mounted for
 * the whole app, so every "Add to Cart" surface (menu grid, landing top-deals,
 * product cards) funnels into the same premium experience without prop drilling.
 */
export const CustomizeProvider = ({ children }: { children: ReactNode }) => {
    const [product, setProduct] = useState<CustomizeTarget | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback((next: CustomizeTarget) => {
        setProduct((current) => (current?.id === next.id ? current : next));
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    const value = useMemo(
        () => ({ product, isOpen, open, close }),
        [product, isOpen, open, close]
    );

    return (
        <CustomizeUIContext.Provider value={value}>
            {children}
            <CustomizeMealModal />
        </CustomizeUIContext.Provider>
    );
};
