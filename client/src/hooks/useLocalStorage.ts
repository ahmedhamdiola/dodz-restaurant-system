import { useLayoutEffect, useState, type Dispatch, type SetStateAction } from "react"

export const useLocalStorage = <T>(
    key: string,
    initialValue: T | (() => T),
    sanitize?: (parsed: unknown) => T
): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
        }
        const raw = window.localStorage.getItem(key)
        if (raw === null) {
            return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
        }
        try {
            const parsed: unknown = JSON.parse(raw)
            return sanitize ? sanitize(parsed) : (parsed as T)
        } catch {
            return sanitize ? sanitize(raw) : (raw as unknown as T)
        }
    })

    useLayoutEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}