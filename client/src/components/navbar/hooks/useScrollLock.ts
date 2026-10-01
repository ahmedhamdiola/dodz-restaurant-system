import { useEffect } from "react"

/**
 * Scroll lock with a reference count. Multiple overlays lock the page at the same
 * time (the navbar sidebar, the cart drawer, the customize sheet, and the admin
 * dialogs which can nest the modifier picker), so each consumer must not restore
 * `overflow` when it unmounts — otherwise the first overlay to close unlocks the
 * page behind one that is still open. The original value is captured once, when
 * the first consumer locks, and restored when the last one releases.
 */
let lockCount = 0
let originalOverflow: string | null = null

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return

        if (lockCount === 0) {
            originalOverflow = document.documentElement.style.overflow
            document.documentElement.style.overflow = "hidden"
        }
        lockCount += 1

        return () => {
            lockCount -= 1
            if (lockCount === 0) {
                document.documentElement.style.overflow = originalOverflow ?? ""
                originalOverflow = null
            }
        }
    }, [isLocked])
}