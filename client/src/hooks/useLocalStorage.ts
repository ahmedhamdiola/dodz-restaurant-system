import { useLayoutEffect, useState, type Dispatch, type SetStateAction } from "react"

const readValue = <T,>(key: string, initialValue: T | (() => T), sanitize?: (parsed: unknown) => T): T => {
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
}

export const useLocalStorage = <T,>(
    key: string,
    initialValue: T | (() => T),
    sanitize?: (parsed: unknown) => T
): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => readValue(key, initialValue, sanitize))

    // Re-read when the key changes (login/logout switches the scope). Without
    // this the old scope's state would be written over the new key's stored
    // value on the next effect run.
    const [prevKey, setPrevKey] = useState(key)
    if (key !== prevKey) {
        setPrevKey(key)
        setValue(readValue(key, initialValue, sanitize))
    }

    useLayoutEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}
