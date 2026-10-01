import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Tweens a number toward its new value with requestAnimationFrame so the modal's
 * running total rolls instead of snapping. Honors `prefers-reduced-motion` by
 * returning the target immediately.
 */
export const useAnimatedNumber = (value: number, duration = 280): number => {
    // Read once at mount: the preference rarely changes mid-session and this keeps
    // the render pure (no DOM reads, no state updates inside the effect).
    const [reducedMotion] = useState(prefersReducedMotion);
    const [display, setDisplay] = useState(value);
    const fromRef = useRef(value);
    // Mirrors `display` so the cleanup below can read the number currently on
    // screen without depending on a stale closure.
    const shownRef = useRef(value);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (reducedMotion || duration <= 0) return;

        const from = fromRef.current;
        if (from === value) return;

        const start = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            if (progress < 1) {
                const next = from + (value - from) * easeOutCubic(progress);
                shownRef.current = next;
                setDisplay(next);
                frameRef.current = requestAnimationFrame(step);
                return;
            }
            // Land exactly on the target: the eased value can miss it by a
            // fraction of a cent, which would render as a flickering last digit.
            shownRef.current = value;
            setDisplay(value);
            fromRef.current = value;
        };

        frameRef.current = requestAnimationFrame(step);
        return () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
            // Restart from whatever is currently painted, NOT from the interrupted
            // target. Setting `fromRef` to `value` here made the number jump
            // backwards mid-tween whenever a new total arrived before the last
            // animation finished.
            fromRef.current = shownRef.current;
        };
    }, [value, duration, reducedMotion]);

    return reducedMotion ? value : display;
};
