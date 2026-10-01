import { useEffect, useRef } from "react"

/**
 * Escape handler stack. Several overlays can be mounted at once (the cart drawer
 * and the customize sheet are both global, and the admin product dialog nests the
 * modifier picker), so a single Escape press must only reach the topmost one.
 * Handlers register on mount and release on unmount, which makes "last registered"
 * the topmost because a nested overlay mounts after its parent.
 */
const handlers: Array<() => void> = []

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    handlers[handlers.length - 1]?.()
}

export const useEscapeKey = (active: boolean, onEscape: () => void) => {
    // Keep the latest callback without re-registering, so the stack position of an
    // overlay never changes just because its handler identity changed.
    const onEscapeRef = useRef(onEscape)
    useEffect(() => {
        onEscapeRef.current = onEscape
    }, [onEscape])

    useEffect(() => {
        if (!active) return

        const handler = () => onEscapeRef.current()
        handlers.push(handler)
        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            const index = handlers.lastIndexOf(handler)
            if (index !== -1) handlers.splice(index, 1)
        }
    }, [active])
}