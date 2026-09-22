import { api, unwrap } from "../../../lib/api";
import type {
    AdminOrder,
    Branch,
    BranchOrderCount,
    DashboardStats,
    OrderStatus,
    OrdersFilters,
} from "../types";

interface BranchDTO {
    id: number;
    name: string;
    area: string;
}

interface OrderDTO {
    id: number;
    branch_id: number;
    branch_name: string;
    customer_name: string;
    customer_phone: string | null;
    items: string;
    status: OrderStatus;
    total: number;
    created_at: string;
}

interface StatsDTO {
    totalRevenue: number;
    avgOrderValue: number;
    orderCount: number;
    ordersToday: number;
    statusSlices: Array<{ status: OrderStatus; count: number }>;
    revenueLast7Days: Array<{ day: string; revenue: number }>;
    topProducts: Array<{ name: string; sold: number; revenue: number }>;
    recentOrders: OrderDTO[];
}

interface CountDTO {
    branch_id: number;
    branch_name: string;
    area: string;
    total_orders: number;
    completed: number;
    preparing: number;
    on_the_way: number;
    cancelled: number;
    revenue: number;
}

export const ADMIN_STATUSES: OrderStatus[] = ["Completed", "Preparing", "On the way", "Cancelled"];

const mapOrder = (order: OrderDTO): AdminOrder => ({
    id: order.id,
    branchId: order.branch_id,
    branchName: order.branch_name,
    customerName: order.customer_name,
    customerPhone: order.customer_phone ?? undefined,
    items: order.items,
    total: order.total,
    status: order.status,
    date: order.created_at,
});

const mapStats = (stats: StatsDTO): DashboardStats => {
    const slices = ADMIN_STATUSES.map((status) => ({
        label: status,
        count: stats.statusSlices.find((slice) => slice.status === status)?.count ?? 0,
    }));

    const top = stats.topProducts;
    const maxRevenue = Math.max(...top.map((product) => product.revenue), 1);

    return {
        totalRevenue: stats.totalRevenue,
        avgOrderValue: stats.avgOrderValue,
        orderCount: stats.orderCount,
        ordersToday: stats.ordersToday,
        statusSlices: slices,
        revenueLast7Days: stats.revenueLast7Days,
        topProducts: top.map((product) => ({
            ...product,
            share: (product.revenue / maxRevenue) * 100,
        })),
        recentOrders: stats.recentOrders.map(mapOrder),
    };
};

const mapCount = (row: CountDTO): BranchOrderCount => ({
    branchId: row.branch_id,
    branchName: row.branch_name,
    area: row.area,
    totalOrders: row.total_orders,
    completed: row.completed,
    preparing: row.preparing,
    onTheWay: row.on_the_way,
    cancelled: row.cancelled,
    revenue: row.revenue,
});

export const ordersApi = {
    getBranches(): Promise<Branch[]> {
        return unwrap<BranchDTO[]>(api.get("/branches")).then((branches) =>
            branches.map((branch) => ({
                id: branch.id,
                name: branch.name,
                area: branch.area,
            }))
        );
    },
    getOrderStats(branchId?: number): Promise<DashboardStats> {
        return unwrap<StatsDTO>(api.get("/orders/stats", { params: branchId ? { branchId } : {} })).then(
            mapStats
        );
    },
    getOrdersCountByBranch(): Promise<BranchOrderCount[]> {
        return unwrap<CountDTO[]>(api.get("/orders/count")).then((rows) => rows.map(mapCount));
    },
    getOrders(filters: OrdersFilters): Promise<AdminOrder[]> {
        return unwrap<OrderDTO[]>(
            api.get("/orders", {
                params: {
                    branchId: filters.branchId,
                    status: filters.status === "All" ? undefined : filters.status,
                    customerPhone: filters.customerPhone,
                },
            })
        ).then((orders) => orders.map(mapOrder));
    },
    updateOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
        return unwrap<OrderDTO>(api.patch(`/orders/${id}/status`, { status })).then(mapOrder);
    },
};