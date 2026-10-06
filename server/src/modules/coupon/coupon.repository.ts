import type { Pool, PoolClient } from "pg";
import { pool } from "../../config/database.js";
import { Coupon } from "./coupon.types.js";

/** Either the pool (standalone reads) or the caller's transaction client. */
type Queryable = Pool | PoolClient;

export const CouponRepository = () => {
    const getCouponByCode = async (code: string, client?: Queryable): Promise<Coupon | null> => {
        const db = client ?? pool;
        const result = await db.query(
            `SELECT id, code, name, type, value, min_order_amount, max_uses, is_active, expires_at
             FROM coupons
             WHERE LOWER(code) = LOWER($1) AND is_deleted = false`,
            [code]
        );
        const row = result.rows[0];
        if (!row) return null;
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            type: row.type,
            value: Number(row.value),
            minOrderAmount: Number(row.min_order_amount),
            maxUses: row.max_uses,
            isActive: row.is_active,
            isDeleted: row.is_deleted,
            expiresAt: row.expires_at,
        };
    };

    const getCouponUsageCount = async (couponId: number, client?: Queryable): Promise<number> => {
        const db = client ?? pool;
        const result = await db.query(
            `SELECT COUNT(*)::int AS c FROM order_coupons WHERE coupon_id = $1`,
            [couponId]
        );
        return result.rows[0]?.c ?? 0;
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

    const getAllCoupons = async () => {
        const result = await pool.query(
            `SELECT id, code, name, type, value, min_order_amount, max_uses, is_active, expires_at, is_deleted, created_at, updated_at
             FROM coupons
             ORDER BY id DESC`
        );
        return result.rows;
    };

    return { getCouponByCode, getCouponUsageCount, insertOrderCoupon, getAllCoupons };
};
