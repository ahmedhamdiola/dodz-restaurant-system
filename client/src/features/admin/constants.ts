import type { OrderStatus } from "./types";

export const STATUS_COLORS: Record<string, string> = {
    Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "On the way": "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    Preparing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Suspended: "bg-red-500/10 text-red-600 dark:text-red-400",
    "Out of stock": "bg-red-500/10 text-red-600 dark:text-red-400",
    Open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Closed: "bg-red-500/10 text-red-600 dark:text-red-400",
    Draft: "bg-muted text-muted-foreground",
};

// Forward-only status flow: Completed and Cancelled are terminal.
export const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    Preparing: ["On the way", "Completed", "Cancelled"],
    "On the way": ["Completed", "Cancelled"],
    Completed: [],
    Cancelled: [],
};