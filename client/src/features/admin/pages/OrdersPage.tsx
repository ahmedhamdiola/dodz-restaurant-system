import { useMemo, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { ALL_ORDERS } from "../data";
import type { OrderStatus } from "../types";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

const FILTERS: Array<{ label: string; value: OrderStatus | "All" }> = [
    { label: "All", value: "All" },
    { label: "Completed", value: "Completed" },
    { label: "Preparing", value: "Preparing" },
    { label: "On the way", value: "On the way" },
    { label: "Cancelled", value: "Cancelled" },
];

const formatTotal = (total: number) =>
    `EGP ${total.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

const OrdersPage = () => {
    const [filter, setFilter] = useState<OrderStatus | "All">("All");

    const orders = useMemo(
        () => (filter === "All" ? ALL_ORDERS : ALL_ORDERS.filter((order) => order.status === filter)),
        [filter]
    );

    const counts = useMemo(() => {
        const map = new Map<string, number>();
        for (const order of ALL_ORDERS) map.set(order.status, (map.get(order.status) ?? 0) + 1);
        return map;
    }, []);

    return (
        <div>
            <PageHeader
                title="Orders"
                subtitle="Live stream of incoming orders from every DODZ branch."
                action={
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand">
                        <MapPinIcon className="h-4 w-4" />
                        5 branches online
                    </span>
                }
            />

            <div className="mb-4 flex flex-wrap gap-2">
                {FILTERS.map(({ label, value }) => {
                    const count =
                        value === "All" ? ALL_ORDERS.length : counts.get(value) ?? 0;
                    const isActive = filter === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
                                isActive
                                    ? "border-brand bg-brand text-white"
                                    : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-secondary"
                            }`}
                        >
                            {label}
                            <span className="ml-1.5 opacity-70">{count}</span>
                        </button>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Order</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Items</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders.map((order) => (
                                <tr key={order.id} className="text-secondary transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 font-semibold text-brand">{order.id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{order.customer}</td>
                                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                                        {order.items}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                        {order.date}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                        {formatTotal(order.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;