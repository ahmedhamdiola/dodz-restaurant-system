import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface LogoutButtonProps {
    onLogout: () => void;
}

const LogoutButton = ({ onLogout }: LogoutButtonProps) => (
    <button
        type="button"
        onClick={onLogout}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-transparent px-6 py-3.5 text-sm font-semibold text-red-600 shadow-sm outline-none transition-colors duration-200 hover:border-red-300 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500/40 dark:border-red-500/30 dark:text-red-400 dark:hover:border-red-500/50 dark:hover:bg-red-500/10 sm:mx-auto sm:max-w-md"
    >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        Log out
    </button>
);

export default LogoutButton;