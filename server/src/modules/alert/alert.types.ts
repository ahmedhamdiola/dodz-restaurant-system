// Notes a branch admin sends to the main admins ("we need stock", "we're
// busy") plus the acknowledge/resolve workflow on the receiving side.

export type BranchAlertType = "needs_stock" | "busy" | "other";
export type BranchAlertStatus = "pending" | "acknowledged" | "resolved";

export const BRANCH_ALERT_TYPES: BranchAlertType[] = ["needs_stock", "busy", "other"];
export const BRANCH_ALERT_STATUSES: BranchAlertStatus[] = ["pending", "acknowledged", "resolved"];

export interface BranchAlert {
    id: number;
    branchId: number;
    branchName: string;
    // Null once the sending account is deleted; the message itself survives.
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

export interface AlertFilters {
    status?: BranchAlertStatus;
    branchId?: number;
}

export type AlertErrorCode = "FORBIDDEN" | "NOT_FOUND" | "INVALID_INPUT";

export class AlertError extends Error {
    code: AlertErrorCode;

    constructor(code: AlertErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = "AlertError";
    }
}
