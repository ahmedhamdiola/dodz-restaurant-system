import { PoolClient } from "pg";
import { pool } from "../../config/database.js";
import { OrderFilters, OrderInput, OrderStatus } from "./order.types.js";

export interface PricedItem {
    productID: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface PricedProduct {
    id: number;
    name: string;
    price: number;
    is_available: boolean;
}

/** Pure helper: snapshots prices from fetched product rows and sums each line. */
export const priceOrderItems = (items: { productID: number; quantity: number }[], products: PricedProduct[]): PricedItem[] => {
    const productMap = new Map(products.map((product) => [product.id, product]));
    return items.map((item) => {
        const product = productMap.get(item.productID);
        if (!product) {
            throw new Error(`Product ${item.productID} not found`);
        }
        const unitPrice = Number(product.price);
        return {
            productID: product.id,
            productName: product.name,
            unitPrice,
            quantity: item.quantity,
            subtotal: unitPrice * item.quantity,
        };
    });
};

export interface InsertOrderInput {
    branchID: number;
    customerName: string;
    customerPhone: string | null;
    total: number;
    items: PricedItem[];
    idempotencyKey?: string;
}

/** Inserts an order + its line items inside an already-open transaction (caller owns the client). */
export const insertOrderAndItems = async (client: PoolClient, input: InsertOrderInput) => {
    const orderResult = await client.query(
        `INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, idempotency_key)
         VALUES ($1, $2, $3, 'Preparing', $4, $5) RETURNING id`,
        [input.branchID, input.customerName, input.customerPhone, input.total, input.idempotencyKey ?? null]
    );
    const orderID = orderResult.rows[0].id;

    for (const item of input.items) {
        await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderID, item.productID, item.productName, item.unitPrice, item.quantity, item.subtotal]
        );
    }

    const createdResult = await client.query(
        `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                o.status, o.total, to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
         FROM orders o JOIN branches b ON b.id = o.branch_id
         WHERE o.id = $1`,
        [orderID]
    );

    return {
        ...createdResult.rows[0],
        items: input.items.map((item) => ({
            product_id: item.productID,
            product_name: item.productName,
            unit_price: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
        })),
    };
};

export const OrderRepository = () => {
    const getAllOrders = async (filters: OrderFilters) => {
        const result = await pool.query(
            `SELECT o.id, o.branch_id, b.name AS branch_name, o.customer_name, o.customer_phone,
                    o.status, o.total, oi.items,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             JOIN LATERAL (
                 SELECT STRING_AGG(oi.product_name || CASE WHEN oi.quantity > 1 THEN ' x' || oi.quantity ELSE '' END, ', ' ORDER BY oi.id) AS items
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
                    o.status, o.total,
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
            `SELECT product_id, product_name, unit_price, quantity, subtotal
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
                    o.status, o.total, oi.items,
                    to_char(o.created_at, 'Mon DD, HH12:MI AM') AS created_at
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             JOIN LATERAL (
                 SELECT STRING_AGG(oi.product_name || CASE WHEN oi.quantity > 1 THEN ' x' || oi.quantity ELSE '' END, ', ' ORDER BY oi.id) AS items
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
            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            const created = await insertOrderAndItems(client, {
                branchID: order.branchID,
                customerName: order.customerName,
                customerPhone: order.customerPhone ?? null,
                total,
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