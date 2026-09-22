import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ErrorAlertProps {
    message: string;
    className?: string;
}

const ErrorAlert = ({ message, className = "" }: ErrorAlertProps) => {
    return (
        <div
            role="alert"
            className={`flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 ${className}`}
        >
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
};

export default ErrorAlert;