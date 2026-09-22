import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ToastItem, ToastType } from "./context";

interface ToastViewportProps {
    toasts: ToastItem[];
    onDismiss: (id: number) => void;
}

const ICONS: Record<ToastType, typeof CheckCircleIcon> = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    info: InformationCircleIcon,
};

const ICON_COLORS: Record<ToastType, string> = {
    success: "text-emerald-500",
    error: "text-red-500",
    info: "text-sky-500",
};

const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            return (
                <div
                    key={toast.id}
                    role="status"
                    className="toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
                >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLORS[toast.type]}`} />
                    <p className="min-w-0 flex-1 text-sm text-secondary">{toast.message}</p>
                    <button
                        type="button"
                        onClick={() => onDismiss(toast.id)}
                        aria-label="Dismiss notification"
                        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            );
        })}
    </div>
);

export default ToastViewport;