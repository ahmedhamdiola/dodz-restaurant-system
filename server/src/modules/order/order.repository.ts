import { PoolClient } from "pg";
import { pool } from "../../config/database.js";
import { OrderFilters, OrderInput, OrderStatus, OrderType } from "./order.types.js";
import { computeTotals, resolveDeliveryFee } from "./order.totals.js";
import { SelectedOptionEntry } from "../product/product.options.types.js";

/** One selected option value, snapshotted onto the order line. */
export type PricedItemOption = SelectedOptionEntry;

export interface PricedItem {
    productID: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    optionsSummary: string;
    optionsSnapshot: PricedItemOption[];
}

/**
 * Callers may pass an authoritative unit price (the cart re-prices a customized
 * line server-side) and the selection to snapshot. Anything omitted falls back
 * to the plain product price with no customization.
 */
export interface PricedItemInput {
    productID: number;
    quantity: number;
    unitPrice?: number;
    optionsSummary?: string;
    optionsSnapshot?: PricedItemOption[];
}

export interface PricedProduct {
    id: number;
    name: string;
    price: number;
    is_available: boolean;
    is_modifier?: boolean;
}

/** Pure helper: snapshots prices from fetched product rows and sums each line. */
export const priceOrderItems = (items: PricedItemInput[], products: PricedProduct[]): PricedItem[] => {
    const productMap = new Map(products.map((product) => [product.id, product]));
    return items.map((item) => {
        const product = productMap.get(item.productID);
        if (!product) {
            throw new Error(`Product ${item.productID} not found`);
        }
        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : Number(product.price);
        return {
            productID: product.id,
            productName: product.name,
            unitPrice,
            quantity: item.quantity,
            subtotal: unitPrice * item.quantity,
            optionsSummary: item.optionsSummary ?? "",
            optionsSnapshot: item.optionsSnapshot ?? [],
        };
    });
};

export interface InsertOrderInput {
    branchID: number;
    customerName: string;
    customerPhone: string | null;
    orderType: OrderType;
    /** What the serving branch charges for delivery. Ignored for pickup. */
    deliveryFee: number;
    /** Off-order amount from a coupon. 0 when none applies. */
    discount?: number;
    /** Snapshotted so a receipt can name the offer it was priced under. */
    couponCode?: string | null;
    deliveryAddress?: string | null;
    deliveryLat?: number | null;
    deliveryLng?: number | null;
    items: PricedItem[];
    idempotencyKey?: string;
}

/**
 * Inserts an order + its line items inside an already-open transaction (caller owns the client).
 *
 * Also the single place order money is computed. Both callers used to sum the lines
 * themselves and pass in a bare `total`, which is exactly how a subtotal, a discount
 * and a delivery fee drift apart. They now pass their inputs and the arithmetic
 * happens here, next to the INSERT that persists it.
 *
 * With an idempotency key, the insert is a CLAIM: `ON CONFLICT DO NOTHING` means a
 * concurrent request with the same key already won, and `inserted: false` tells the
 * caller to return that order instead of raising a 23505. Two checkouts can pass
 * the "have we seen this key before?" read at the same time, so the unique index
 * is the only thing that actually makes the key idempotent.
 */
export const insertOrderAndItems = async (client: PoolClient, input: InsertOrderInput) => {
    const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totals = computeTotals(subtotal, input.discount ?? 0, input.deliveryFee);

    const orderResult = await client.query<{ id: number }>(
        `INSERT INTO orders (branch_id, customer_name, customer_phone, status, order_type,
                             subtotal, discount_amount, delivery_fee, coupon_code, total,
                             delivery_address, delivery_lat, delivery_lng, idempotency_key)
         VALUES ($1, $2, $3, 'Preparing', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id`,
        [
            input.branchID,
            input.customerName,
            input.customerPhone,
            input.orderType,
            totals.subtotal,
            totals.discount,
            totals.deliveryFee,
            input.couponCode ?? null,
            totals.total,
            input.deliveryAddress ?? null,
            input.deliveryLat ?? null,
            input.deliveryLng ?? null,
            input.idempotencyKey ?? null,
        ]
    );

    if (orderResult.rowCount === 0) {
        return { inserted: false as const, order: null };
    }

    const orderID = orderResult.rows[0].id;

    for (const item of input.items) {
        await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, options_summary, options_snapshot)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
            [
                orderID,
                item.productID,
                item.productName,
                item.unitPrice,
                item.quantity,
                item.subtotal,
                item.optionsSummary,
                JSON.stringify(item.optionsSnapshot),
            ]
        );
    }

    const createdResult = await client.query(
        `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                o.status, o.order_type, o.subtotal, o.discount_amount, o.delivery_fee,
                o.coupon_code, o.total, o.delivery_address,
                to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
         FROM orders o JOIN branches b ON b.id = o.branch_id
         WHERE o.id = $1`,
        [orderID]
    );

    return {
        inserted: true as const,
        order: {
            ...createdResult.rows[0],
            items: input.items.map((item) => ({
                product_id: item.productID,
                product_name: item.productName,
                unit_price: item.unitPrice,
                quantity: item.quantity,
                subtotal: item.subtotal,
                options_summary: item.optionsSummary,
                options_snapshot: item.optionsSnapshot,
            })),
        },
    };
};

export const OrderRepository = () => {
    const getAllOrders = async (filters: OrderFilters) => {
        const result = await pool.query(
            `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                    o.status, o.order_type, o.subtotal, o.discount_amount, o.delivery_fee,
                    o.total, oi.items,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             JOIN LATERAL (
                  SELECT STRING_AGG(oi.product_name || CASE WHEN oi.options_summary <> '' THEN ' (' || oi.options_summary || ')' ELSE '' END || CASE WHEN oi.quantity > 1 THEN ' x' || oi.quantity ELSE '' END, ', ' ORDER BY oi.id) AS items
                 FROM order_items oi WHERE oi.order_id = o.id
             ) oi ON true
             WHERE o.is_deleted = false
               AND ($1::int IS NULL OR o.branch_id = $1)
               AND ($2::text IS NULL OR o.status = $2)
               AND ($3::text IS NULL OR o.customer_phone = $3)
             ORDER BY o.created_at DESC`,
            [filters.branchID ?? null, filters.status ?? null, filters.customerPhone ?? null]
        );
        return result.rows;
    };

    const getOrderByID = async (id: number) => {
        const orderResult = await pool.query(
            `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                    o.status, o.order_type, o.subtotal, o.discount_amount, o.delivery_fee,
                    o.coupon_code, o.total, o.delivery_address,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             WHERE o.id = $1 AND o.is_deleted = false`,
            [id]
        );
        const order = orderResult.rows[0] ?? null;
        if (order === null) {
            return null;
        }

        const itemsResult = await pool.query(
            `SELECT product_id, product_name, unit_price, quantity, subtotal, options_summary, options_snapshot
             FROM order_items WHERE order_id = $1 ORDER BY id`,
            [id]
        );
        return { ...order, items: itemsResult.rows };
    };

    const getOrdersCountByBranch = async () => {
        const result = await pool.query(
            `SELECT b.id AS branch_id, b.name AS branch_name, b.area,
                    COUNT(o.id)::int AS total_orders,
                    COUNT(o.id) FILTER (WHERE o.status = 'Completed')::int AS completed,
                    COUNT(o.id) FILTER (WHERE o.status = 'Preparing')::int AS preparing,
                    COUNT(o.id) FILTER (WHERE o.status = 'On the way')::int AS on_the_way,
                    COUNT(o.id) FILTER (WHERE o.status = 'Cancelled')::int AS cancelled,
                    COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'Cancelled'), 0) AS revenue
             FROM branches b
             LEFT JOIN orders o ON o.branch_id = b.id AND o.is_deleted = false
             WHERE b.is_deleted = false
             GROUP BY b.id, b.name, b.area
             ORDER BY b.id`
        );
        return result.rows;
    };

    const getOrderStats = async (branchID?: number) => {
        const [summary, statusTomorrowRow] = await Promise.all([
            pool.query(
                `SELECT COALESCE(SUM(total) FILTER (WHERE status <> 'Cancelled'), 0)       AS revenue,
                        COALESCE(AVG(total) FILTER (WHERE status <> 'Cancelled'), 0)       AS avg_order_value,
                        COUNT(*) FILTER (WHERE status <> 'Cancelled')::int                 AS order_count,
                        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status <> 'Cancelled')::int AS orders_today
                 FROM orders
                 WHERE is_deleted = false
                   AND ($1::int IS NULL OR branch_id = $1)`,
                [branchID ?? null]
            ),
            pool.query(
                `SELECT status, COUNT(*)::int AS count
                 FROM orders
                 WHERE is_deleted = false
                   AND created_at::date = CURRENT_DATE
                   AND ($1::int IS NULL OR branch_id = $1)
                 GROUP BY status`,
                [branchID ?? null]
            ),
        ]);

        const revenue7DaysResult = await pool.query(
            `SELECT to_char(d.day, 'Dy') AS day, COALESCE(SUM(o.total), 0) AS revenue
             FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::interval) AS d(day)
             LEFT JOIN orders o ON o.created_at::date = d.day
                AND o.is_deleted = false AND o.status <> 'Cancelled'
                AND ($1::int IS NULL OR o.branch_id = $1)
             GROUP BY d.day
             ORDER BY d.day`,
            [branchID ?? null]
        );

        const topProductsResult = await pool.query(
            `SELECT oi.product_name AS name,
                    SUM(oi.quantity)::int AS sold,
                    SUM(oi.subtotal) AS revenue
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.is_deleted = false AND o.status <> 'Cancelled'
               AND ($1::int IS NULL OR o.branch_id = $1)
             GROUP BY oi.product_name
             ORDER BY sold DESC, revenue DESC
             LIMIT 5`,
            [branchID ?? null]
        );

        const recentOrdersResult = await pool.query(
            `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name,
                    o.status, o.order_type, o.subtotal, o.discount_amount, o.delivery_fee,
                    o.total, oi.items,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             JOIN LATERAL (
                  SELECT STRING_AGG(oi.product_name || CASE WHEN oi.options_summary <> '' THEN ' (' || oi.options_summary || ')' ELSE '' END || CASE WHEN oi.quantity > 1 THEN ' x' || oi.quantity ELSE '' END, ', ' ORDER BY oi.id) AS items
                 FROM order_items oi WHERE oi.order_id = o.id
             ) oi ON true
             WHERE o.is_deleted = false
               AND ($1::int IS NULL OR o.branch_id = $1)
             ORDER BY o.created_at DESC
             LIMIT 5`,
            [branchID ?? null]
        );

        return {
            totalRevenue: Number(summary.rows[0].revenue),
            avgOrderValue: Number(summary.rows[0].avg_order_value),
            orderCount: summary.rows[0].order_count,
            ordersToday: summary.rows[0].orders_today,
            statusSlices: statusTomorrowRow.rows,
            revenueLast7Days: revenue7DaysResult.rows,
            topProducts: topProductsResult.rows,
            recentOrders: recentOrdersResult.rows,
        };
    };

    const createOrder = async (order: OrderInput) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const itemsQuery = await client.query(
                `SELECT id, name, price, is_available FROM products WHERE id = ANY($1::int[]) AND is_deleted = false`,
                [order.items.map((item) => item.productID)]
            );
            const items = priceOrderItems(order.items, itemsQuery.rows as PricedProduct[]);

            // The fee is read inside the transaction from the branch that will
            // actually fulfil the order, never taken from the request body.
            const branchResult = await client.query(
                `SELECT delivery_fee FROM branches WHERE id = $1 AND is_deleted = false`,
                [order.branchID]
            );

            const orderType: OrderType = order.orderType ?? "Pickup";
            const deliveryFee = resolveDeliveryFee(orderType, branchResult.rows[0]?.delivery_fee);

            // No idempotency key here, so the claim insert always wins.
            const { order: created } = await insertOrderAndItems(client, {
                branchID: order.branchID,
                customerName: order.customerName,
                customerPhone: order.customerPhone ?? null,
                orderType,
                deliveryFee,
                deliveryAddress: orderType === "Delivery" ? order.deliveryAddress ?? null : null,
                deliveryLat: orderType === "Delivery" ? order.deliveryLat ?? null : null,
                deliveryLng: orderType === "Delivery" ? order.deliveryLng ?? null : null,
                items,
            });

            await client.query("COMMIT");
            return created;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    const updateOrderStatus = async (id: number, status: OrderStatus) => {
        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND is_deleted = false
               AND (
                     status = $1                                   -- no-op update
                     OR (status = 'Preparing' AND $1 IN ('On the way', 'Completed', 'Cancelled'))
                     OR (status = 'On the way' AND $1 IN ('Completed', 'Cancelled'))
               )
             RETURNING *`,
            [status, id]
        );
        return result.rows[0] ?? null;
    };

    return {
        getAllOrders,
        getOrderByID,
        getOrdersCountByBranch,
        getOrderStats,
        createOrder,
        updateOrderStatus,
    };
};