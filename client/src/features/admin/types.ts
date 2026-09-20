import type { ComponentType, SVGProps } from "react";

export type OrderStatus = "Completed" | "Preparing" | "On the way" | "Cancelled";

export interface AdminOrder {
    id: string;
    customer: string;
    items: string;
    total: number;
    status: OrderStatus;
    date: string;
}

export interface AdminProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    sold: number;
    status: "Active" | "Out of stock" | "Draft";
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