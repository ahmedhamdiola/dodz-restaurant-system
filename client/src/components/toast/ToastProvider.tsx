import {
    useCallback,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { ToastContext, type ToastContextValue, type ToastItem, type ToastType } from "./context";
import ToastViewport from "./ToastViewport";

let nextId = 1;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const push = useCallback(
        (type: ToastType, message: string) => {
            const id = nextId++;
            timersRef.current.set(
                id,
                setTimeout(() => dismiss(id), 4000)
            );
            setToasts((current) => [...current, { id, type, message }]);
        },
        [dismiss]
    );

    const api: ToastContextValue = {
        success: (message) => push("success", message),
        error: (message) => push("error", message),
        info: (message) => push("info", message),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};