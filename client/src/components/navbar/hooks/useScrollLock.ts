import { useEffect } from "react"

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return

        const htmlOverflow = document.documentElement.style.overflow

        document.documentElement.style.overflow = "hidden"

        return () => {
            document.documentElement.style.overflow = htmlOverflow
        }
    }, [isLocked])
}