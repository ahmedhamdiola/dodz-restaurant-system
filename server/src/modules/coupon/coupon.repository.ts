import type { Pool, PoolClient } from "pg";
import { pool } from "../../config/database.js";
import { Coupon, CouponInput } from "./coupon.types.js";

/** Either the pool (standalone reads) or the caller's transaction client. */
type Queryable = Pool | PoolClient;

/** Columns shared by every read path, so the row mappers cannot drift apart. */
const COUPON_COLUMNS = `id, code, name, type, value, min_order_amount, max_uses, is_active, is_deleted, expires_at`;

const mapCoupon = (row: Record<string, unknown>): Coupon => ({
    id: Number(row.id),
    code: String(row.code),
    name: String(row.name),
    type: row.type as Coupon["type"],
    value: Number(row.value),
    minOrderAmount: Number(row.min_order_amount),
    maxUses: row.max_uses === null || row.max_uses === undefined ? null : Number(row.max_uses),
    isActive: Boolean(row.is_active),
    isDeleted: Boolean(row.is_deleted),
    expiresAt: new Date(row.expires_at as string).toISOString(),
});

export const CouponRepository = () => {
    const getCouponByCode = async (code: string, client?: Queryable): Promise<Coupon | null> => {
        const db = client ?? pool;
        const result = await db.query(
            `SELECT ${COUPON_COLUMNS}
             FROM coupons
             WHERE LOWER(code) = LOWER($1) AND is_deleted = false`,
            [code]
        );
        return result.rows[0] ? mapCoupon(result.rows[0]) : null;
    };

    const getCouponByID = async (id: number, client?: Queryable): Promise<Coupon | null> => {
        const db = client ?? pool;
        const result = await db.query(
            `SELECT ${COUPON_COLUMNS} FROM coupons WHERE id = $1`,
            [id]
        );
        return result.rows[0] ? mapCoupon(result.rows[0]) : null;
    };

    const getCouponUsageCount = async (couponId: number, client?: Queryable): Promise<number> => {
        const db = client ?? pool;
        const result = await db.query(
            `SELECT COUNT(*)::int AS c FROM order_coupons WHERE coupon_id = $1`,
            [couponId]
        );
        return result.rows[0]?.c ?? 0;
    };

    /**
     * Admin listing, including redemptions. The LEFT JOIN counts uses in the same
     * round trip: a coupon at its max_uses is exactly what an admin needs to see,
     * and N+1 counting would make that view slow for no benefit.
     */
    const getAllCoupons = async (): Promise<Coupon[]> => {
        const result = await pool.query(
            `SELECT c.id, c.code, c.name, c.type, c.value, c.min_order_amount,
                    c.max_uses, c.is_active, c.is_deleted, c.expires_at,
                    COUNT(oc.id)::int AS usage_count
             FROM coupons c
             LEFT JOIN order_coupons oc ON oc.coupon_id = c.id
             GROUP BY c.id
             ORDER BY c.id DESC`
        );
        return result.rows.map((row) => ({ ...mapCoupon(row), usageCount: Number(row.usage_count) }));
    };

    /**
     * True when the code is already taken by a coupon that is not soft-deleted.
     * The unique index also covers this, but it would surface as a 500; checking
     * first lets the admin form say "that code is taken" instead.
     */
    const codeExists = async (code: string, excludeId?: number): Promise<boolean> => {
        const result = await pool.query(
            `SELECT 1 FROM coupons
             WHERE LOWER(code) = LOWER($1) AND is_deleted = false AND ($2::int IS NULL OR id <> $2)`,
            [code, excludeId ?? null]
        );
        return result.rowCount !== 0;
    };

    const createCoupon = async (input: CouponInput): Promise<Coupon> => {
        const result = await pool.query(
            `INSERT INTO coupons (code, name, type, value, min_order_amount, max_uses, is_active, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING ${COUPON_COLUMNS}`,
            [
                input.code,
                input.name,
                input.type,
                input.value,
                input.minOrderAmount ?? 0,
                input.maxUses ?? null,
                input.isActive ?? true,
                input.expiresAt,
            ]
        );
        return mapCoupon(result.rows[0]);
    };

    /**
     * Updates every editable column in one statement.
     *
     * `redemptions` is not writable: past orders keep the discount they were
     * actually charged, so changing a coupon's value never rewrites history.
     */
    const updateCoupon = async (id: number, input: CouponInput): Promise<Coupon | null> => {
        const result = await pool.query(
            `UPDATE coupons SET
                    code = $2,
                    name = $3,
                    type = $4,
                    value = $5,
                    min_order_amount = $6,
                    max_uses = $7,
                    is_active = $8,
                    expires_at = $9,
                    updated_at = NOW()
             WHERE id = $1 AND is_deleted = false
             RETURNING ${COUPON_COLUMNS}`,
            [
                id,
                input.code,
                input.name,
                input.type,
                input.value,
                input.minOrderAmount ?? 0,
                input.maxUses ?? null,
                input.isActive ?? true,
                input.expiresAt,
            ]
        );
        return result.rows[0] ? mapCoupon(result.rows[0]) : null;
    };

    /**
     * Soft delete, because order_coupons keeps a RESTRICT reference for the audit
     * trail. A hard delete would either break past receipts or require cascade,
     * and either way the redemption history would be lost.
     */
    const softDeleteCoupon = async (id: number): Promise<boolean> => {
        const result = await pool.query(
            `UPDATE coupons SET is_deleted = true, is_active = false, updated_at = NOW()
             WHERE id = $1 AND is_deleted = false`,
            [id]
        );
        return result.rowCount !== 0;
    };

    const insertOrderCoupon = async (
        client: PoolClient,
        orderId: number,
        couponId: number,
        discountAmount: number
    ): Promise<void> => {
        await client.query(
            `INSERT INTO order_coupons (order_id, coupon_id, discount_amount, applied_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (order_id) DO NOTHING`,
            [orderId, couponId, discountAmount]
        );
    };

    return {
        getCouponByCode,
        getCouponByID,
        getCouponUsageCount,
        getAllCoupons,
        codeExists,
        createCoupon,
        updateCoupon,
        softDeleteCoupon,
        insertOrderCoupon,
    };
};
