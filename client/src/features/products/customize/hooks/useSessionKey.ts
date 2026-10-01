import { useState } from "react";

/**
 * A string that changes every time the customize modal is (re)opened for a
 * product. Uses React's "adjust state during a render" pattern — the same
 * discipline the cart drawer uses — so consumers can reset their local state
 * without an effect-driven setState.
 */
export const useSessionKey = (isOpen: boolean, productID: number | null): string => {
    const [counter, setCounter] = useState(0);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) setCounter((value) => value + 1);
    }

    return `${productID ?? 0}:${counter}`;
};
