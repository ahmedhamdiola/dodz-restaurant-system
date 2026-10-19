// Shared shapes for the branch-admin surfaces (stock + alerts). The main-admin
// alerts inbox reuses these too, so the DTOs only live in one place.

export interface BranchStockItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    /** Global storefront flag. Read-only here; only main admins change it. */
    isAvailable: boolean;
    categoryName: string;
    categorySlug: string;
    quantity: number;
    lowStockThreshold: number;
}

export interface StockUpdate {
    quantity: number;
    /** Omitted on a quick quantity edit to keep the branch's existing value. */
    lowStockThreshold?: number;
}

export interface BranchInfo {
    id: number;
    name: string;
    area: string;
}

export type BranchAlertType = "needs_stock" | "busy" | "other";
export type BranchAlertStatus = "pending" | "acknowledged" | "resolved";

export const ALERT_TYPE_LABELS: Record<BranchAlertType, string> = {
    needs_stock: "Needs stock",
    busy: "Busy",
    other: "Other",
};

export interface BranchAlert {
    id: number;
    branchId: number;
    branchName: string;
    senderId: number | null;
    senderName: string | null;
    type: BranchAlertType;
    message: string;
    status: BranchAlertStatus;
    acknowledgedBy: number | null;
    acknowledgedByName: string | null;
    acknowledgedAt: string | null;
    createdAt: string;
}

export interface SendAlertInput {
    type: BranchAlertType;
    message: string;
}

/** Low stock = at or below the branch's threshold; out = nothing left. */
export const stockLevel = (item: BranchStockItem): "out" | "low" | "ok" => {
    if (item.quantity <= 0) return "out";
    if (item.quantity <= item.lowStockThreshold) return "low";
    return "ok";
};
