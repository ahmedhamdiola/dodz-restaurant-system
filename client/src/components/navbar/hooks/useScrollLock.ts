import { useEffect } from "react"

/**
 * Locks page scrolling (on both <body> and <html>) while `isLocked` is true.
 * Restores the previous overflow values when unlocked or on unmount.
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return

        const bodyOverflow = document.body.style.overflow
        const htmlOverflow = document.documentElement.style.overflow

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = bodyOverflow
            document.documentElement.style.overflow = htmlOverflow
        }
    }, [isLocked])
}