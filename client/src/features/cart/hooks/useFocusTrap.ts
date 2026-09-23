import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a modal container while `active`. Focuses the
 * container on open and restores the previously focused element on close.
 * The sidebar has no trap today; the cart drawer is the first consumer.
 */
export const useFocusTrap = <T extends HTMLElement>(ref: RefObject<T | null>, active: boolean) => {
    useEffect(() => {
        if (!active) return;
        const node = ref.current;
        if (!node) return;

        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        node.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Tab") return;
            const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [ref, active]);
};