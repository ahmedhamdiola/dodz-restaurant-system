import type { ComponentType, SVGProps } from "react";

export type OrderStatus = "Completed" | "Preparing" | "On the way" | "Cancelled";

export interface AdminOrder {
    id: number;
    branchId: number;
    branchName: string;
    customerName: string;
    customerPhone?: string;
    items: string;
    total: number;
    status: OrderStatus;
    date: string;
}

export interface Branch {
    id: number;
    name: string;
    area: string;
}

export interface BranchOrderCount {
    branchId: number;
    branchName: string;
    area: string;
    totalOrders: number;
    completed: number;
    preparing: number;
    onTheWay: number;
    cancelled: number;
    revenue: number;
}

export interface DashboardStats {
    totalRevenue: number;
    avgOrderValue: number;
    orderCount: number;
    ordersToday: number;
    statusSlices: OrderStatusSlice[];
    revenueLast7Days: RevenuePoint[];
    topProducts: TopProduct[];
    recentOrders: AdminOrder[];
}

export interface OrdersFilters {
    branchId?: number;
    status?: OrderStatus | "All";
    customerPhone?: string;
}

export interface AdminProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    sold: number;
    isAvailable: boolean;
    status: "Active" | "Out of stock";
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    orders: number;
    joined: string;
    status: "Active" | "Suspended";
}

export interface AdminBranch {
    id: number;
    name: string;
    area: string;
    address: string;
    hours: string;
    phone: string;
    status: "Open" | "Closed";
}

export interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
    share: number;
}

export interface RevenuePoint {
    day: string;
    revenue: number;
}

export interface OrderStatusSlice {
    label: OrderStatus;
    count: number;
}

export interface Stat {
    label: string;
    value: string;
    change: number;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
}
export type CouponType = "percentage" | "fixed_amount" | "free_delivery";

export interface AdminCoupon {
    id: number;
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    /** null means unlimited redemptions. */
    maxUses: number | null;
    isActive: boolean;
    isDeleted: boolean;
    expiresAt: string;
    /** Redemptions so far, so an admin can see a coupon sitting at its cap. */
    usageCount: number;
}

/** The editable half of a coupon. `maxUses: null` is unlimited. */
export interface CouponInput {
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minOrderAmount: number;
    maxUses: number | null;
    isActive: boolean;
    expiresAt: string;
}
