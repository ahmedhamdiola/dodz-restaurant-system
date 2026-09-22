import { useMemo, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../features/admin/components/PageHeader";
import { STATUS_COLORS, NEXT_ORDER_STATUSES } from "../../../features/admin/constants";
import { useBranches, useOrders, useUpdateOrderStatus } from "../../../features/admin/hooks/useDashboardData";
import type { AdminOrder, OrderStatus } from "../../../features/admin/types";

const FILTERS: Array<{ label: string; value: OrderStatus | "All" }> = [
    { label: "All", value: "All" },
    { label: "Completed", value: "Completed" },
    { label: "Preparing", value: "Preparing" },
    { label: "On the way", value: "On the way" },
    { label: "Cancelled", value: "Cancelled" },
];

const formatTotal = (total: number) =>
    `EGP ${total.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

const StatusSelect = ({ order }: { order: AdminOrder }) => {
    const updateStatus = useUpdateOrderStatus();
    const nextStatuses = NEXT_ORDER_STATUSES[order.status];
    const isTerminal = nextStatuses.length === 0;

    return (
        <select
            value={order.status}
            disabled={isTerminal}
            title={isTerminal ? "This status cannot be changed" : "Update status"}
            onChange={(event) =>
                updateStatus.mutate({
                    id: order.id,
                    status: event.target.value as OrderStatus,
                })
            }
            className={`cursor-pointer appearance-none rounded-full border-0 bg-transparent py-1 pr-1 pl-2.5 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-70 ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}
        >
            <option value={order.status} disabled>
                {order.status}
            </option>
            {nextStatuses.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
            ))}
        </select>
    );
};

const OrdersPage = () => {
    const { data: branches = [] } = useBranches();
    const [branchId, setBranchId] = useState<number | undefined>(undefined);
    const [filter, setFilter] = useState<OrderStatus | "All">("All");

    const { data: allOrders = [] } = useOrders({ branchId });

    const orders = useMemo(
        () => (filter === "All" ? allOrders : allOrders.filter((order) => order.status === filter)),
        [allOrders, filter]
    );

    const counts = useMemo(() => {
        const map = new Map<string, number>();
        for (const order of allOrders) map.set(order.status, (map.get(order.status) ?? 0) + 1);
        return map;
    }, [allOrders]);

    const scope = branches.find((branch) => branch.id === branchId)?.name ?? "All branches";

    return (
        <div>
            <PageHeader
                title="Orders"
                subtitle={`Live orders · ${scope.toLowerCase()}`}
                action={
                    <label className="relative inline-flex items-center">
                        <select
                            value={branchId ?? "all"}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setBranchId(Number.isNaN(value) ? undefined : value);
                            }}
                            className="cursor-pointer appearance-none rounded-full border border-border bg-card py-2 pr-9 pl-4 text-xs font-semibold uppercase tracking-wide text-secondary outline-none transition-colors hover:border-brand/40"
                        >
                            <option value="all">All branches</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
                    </label>
                }
            />

            <div className="mb-4 flex flex-wrap gap-2">
                {FILTERS.map(({ label, value }) => {
                    const count = value === "All" ? allOrders.length : counts.get(value) ?? 0;
                    const isActive = filter === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${isActive
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
                    <table className="w-full min-w-[780px] text-sm">
                        <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Order</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Branch</th>
                                <th className="px-4 py-3 font-semibold">Items</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="text-secondary transition-colors hover:bg-muted/50">
                                        <td className="px-4 py-3 font-semibold text-brand">#{order.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {order.customerName}
                                            <span className="block text-xs text-muted-foreground">
                                                {order.customerPhone}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {order.branchName}
                                        </td>
                                        <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                                            {order.items}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {order.date}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusSelect order={order} />
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                            {formatTotal(order.total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;