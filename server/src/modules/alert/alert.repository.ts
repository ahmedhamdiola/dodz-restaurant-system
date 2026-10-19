import { pool } from "../../config/database.js";
import { BranchAlert, BranchAlertStatus, BranchAlertType } from "./alert.types.js";

// Every read joins the display names so the admin UI never has to resolve ids.
const ALERT_SELECT = `
    SELECT a.id, a.branch_id, b.name AS branch_name,
           a.sender_id, u.name AS sender_name,
           a.type, a.message, a.status,
           a.acknowledged_by, ab.name AS acknowledged_by_name, a.acknowledged_at,
           a.created_at
    FROM branch_alerts a
    INNER JOIN branches b ON b.id = a.branch_id
    LEFT JOIN users u ON u.id = a.sender_id
    LEFT JOIN users ab ON ab.id = a.acknowledged_by
`;

const mapAlert = (row: Record<string, unknown>): BranchAlert => ({
    id: row.id as number,
    branchId: row.branch_id as number,
    branchName: row.branch_name as string,
    senderId: (row.sender_id as number | null) ?? null,
    senderName: (row.sender_name as string | null) ?? null,
    type: row.type as BranchAlertType,
    message: row.message as string,
    status: row.status as BranchAlertStatus,
    acknowledgedBy: (row.acknowledged_by as number | null) ?? null,
    acknowledgedByName: (row.acknowledged_by_name as string | null) ?? null,
    acknowledgedAt: row.acknowledged_at ? String(row.acknowledged_at) : null,
    createdAt: String(row.created_at),
});

export const AlertRepository = () => {
    const createAlert = async (params: { branchId: number; senderId: number; type: BranchAlertType; message: string }) => {
        const result = await pool.query(
            `INSERT INTO branch_alerts (branch_id, sender_id, type, message)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [params.branchId, params.senderId, params.type, params.message]
        );
        return result.rows[0] ? getAlertByID(result.rows[0].id) : null;
    };

    const getAlertByID = async (id: number): Promise<BranchAlert | null> => {
        const result = await pool.query(`${ALERT_SELECT} WHERE a.id = $1 AND a.is_deleted = false`, [id]);
        return result.rows[0] ? mapAlert(result.rows[0]) : null;
    };

    /** `branchId = null` means every branch (main-admin inbox). */
    const listAlerts = async (filters: { status: BranchAlertStatus | null; branchId: number | null; limit: number }): Promise<BranchAlert[]> => {
        const result = await pool.query(
            `${ALERT_SELECT}
             WHERE a.is_deleted = false
               AND ($1::text IS NULL OR a.status = $1)
               AND ($2::int IS NULL OR a.branch_id = $2)
             ORDER BY a.created_at DESC, a.id DESC
             LIMIT $3`,
            [filters.status, filters.branchId, filters.limit]
        );
        return result.rows.map(mapAlert);
    };

    /**
     * Moves an alert along pending → acknowledged → resolved. The first
     * acknowledgement is sticky: re-resolving later does not overwrite who
     * originally picked it up. `shouldAcknowledge` is computed in the service
     * rather than derived from $2 in SQL — reusing one placeholder as both the
     * status column and a text comparison makes Postgres deduce conflicting
     * types ("inconsistent types deduced for parameter $2").
     */
    const updateStatus = async (id: number, status: BranchAlertStatus, actorId: number, shouldAcknowledge: boolean) => {
        const result = await pool.query(
            `UPDATE branch_alerts
             SET status = $2,
                 acknowledged_by = CASE WHEN $3 THEN COALESCE(acknowledged_by, $4) ELSE acknowledged_by END,
                 acknowledged_at = CASE WHEN $3 THEN COALESCE(acknowledged_at, CURRENT_TIMESTAMP) ELSE acknowledged_at END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND is_deleted = false
             RETURNING id`,
            [id, status, shouldAcknowledge, actorId]
        );
        return result.rows[0] ? getAlertByID(id) : null;
    };

    /** `branchId = null` counts across every branch. */
    const countPending = async (branchId: number | null): Promise<number> => {
        const result = await pool.query(
            `SELECT COUNT(*)::int AS count
             FROM branch_alerts
             WHERE is_deleted = false
               AND status = 'pending'
               AND ($1::int IS NULL OR branch_id = $1)`,
            [branchId]
        );
        return result.rows[0].count;
    };

    return { createAlert, getAlertByID, listAlerts, updateStatus, countPending };
};
