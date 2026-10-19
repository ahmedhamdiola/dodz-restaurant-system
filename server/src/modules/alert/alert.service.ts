import { AuthUser } from "../auth/auth.types.js";
import { UserRepository } from "../users/user.repository.js";
import { AlertRepository } from "./alert.repository.js";
import {
    AlertError,
    AlertFilters,
    BRANCH_ALERT_STATUSES,
    BRANCH_ALERT_TYPES,
    BranchAlertStatus,
    BranchAlertType,
} from "./alert.types.js";

const MAX_MESSAGE_LENGTH = 500;
const DEFAULT_LIMIT = 100;

export const AlertService = () => {
    const repo = AlertRepository();
    const users = UserRepository();

    // Read from the users table (not the JWT) so a branch reassignment takes
    // effect immediately instead of waiting for the next login.
    const getCallerBranch = async (caller: { id: number; role: string }) => {
        const me = await users.getUserByID(caller.id);
        return me?.branch_id ?? null;
    };

    /**
     * Only branch admins send alerts: the whole point is the branch speaking
     * to the main office, and the branch comes from the account, never the body.
     */
    const createAlert = async (caller: { id: number; role: string }, input: { type: unknown; message: unknown }) => {
        if (caller.role !== "branch_admin") {
            throw new AlertError("FORBIDDEN", "Only a branch admin can send an alert");
        }
        const me = await users.getUserByID(caller.id);
        if (!me || !me.branch_id) {
            throw new AlertError("FORBIDDEN", "Your account is not assigned to a branch");
        }
        if (!BRANCH_ALERT_TYPES.includes(input.type as BranchAlertType)) {
            throw new AlertError("INVALID_INPUT", "type must be one of needs_stock, busy, other");
        }
        const type = input.type as BranchAlertType;
        const message = typeof input.message === "string" ? input.message.trim() : "";
        if (!message) {
            throw new AlertError("INVALID_INPUT", "Message is required");
        }
        if (message.length > 500) {
            throw new AlertError("INVALID_INPUT", "Message must be 500 characters or fewer");
        }

        return repo.createAlert({ branchId: me.branch_id, senderId: caller.id, type, message });
    };

    /**
     * Main admins see every branch (optionally filtered); a branch admin sees
     * only their own branch's sent history, whatever filter they pass.
     */
    const listAlerts = async (caller: AuthUser, filters: AlertFilters) => {
        if (filters.status !== undefined && !BRANCH_ALERT_STATUSES.includes(filters.status)) {
            throw new AlertError("INVALID_INPUT", "Invalid status filter");
        }

        let branchId: number | null = null;
        if (caller.role === "branch_admin") {
            const me = await users.getUserByID(caller.id);
            if (!me || !me.branch_id) {
                throw new AlertError("FORBIDDEN", "No branch is assigned to your account");
            }
            branchId = me.branch_id;
        } else if (caller.role === "admin") {
            branchId = filters.branchId ?? null;
        } else {
            throw new AlertError("FORBIDDEN", "Forbidden");
        }

        return repo.listAlerts({ status: filters.status ?? null, branchId, limit: 100 });
    };

    const countPending = async (caller: AuthUser) => {
        if (caller.role === "admin") {
            return repo.countPending(null);
        }
        if (caller.role === "branch_admin") {
            const me = await users.getUserByID(caller.id);
            if (!me || !me.branch_id) {
                throw new AlertError("FORBIDDEN", "No branch is assigned to your account");
            }
            return repo.countPending(me.branch_id);
        }
        throw new AlertError("FORBIDDEN", "Forbidden");
    };

    /** Main admins only (route-level requireRole) move an alert along. */
    const updateStatus = async (caller: AuthUser, id: number, status: BranchAlertStatus) => {
        if (!Number.isInteger(id) || id <= 0) {
            throw new AlertError("INVALID_INPUT", "Invalid alert id");
        }
        if (!BRANCH_ALERT_STATUSES.includes(status)) {
            throw new AlertError("INVALID_INPUT", "Invalid status");
        }
        const updated = await repo.updateStatus(id, status, caller.id, status !== "pending");
        if (!updated) {
            throw new AlertError("NOT_FOUND", "Alert not found");
        }
        return updated;
    };

    return { createAlert, listAlerts, updateStatus, countPending };
};
