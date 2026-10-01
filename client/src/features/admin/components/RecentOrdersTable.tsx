import type { AdminOrder } from "../types";
import DashboardCard, { TextLink } from "./DashboardCard";
import StatusBadge from "./StatusBadge";

interface RecentOrdersTableProps {
    orders: AdminOrder[];
    scope?: string;
}

const formatTotal = (total: number) =>
    `EGP ${total.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

const RecentOrdersTable = ({ orders, scope = "all branches" }: RecentOrdersTableProps) => {
    return (
        <DashboardCard
            title="Recent Orders"
            subtitle={`Latest activity · ${scope}`}
            action={<TextLink to="/admin/orders">View all</TextLink>}
        >
            <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[620px] text-sm">
                    <thead>
                        <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <th className="pb-3 pr-4 font-semibold">Order</th>
                            <th className="pb-3 pr-4 font-semibold">Customer</th>
                            <th className="pb-3 pr-4 font-semibold">Branch</th>
                            <th className="pb-3 pr-4 font-semibold">Items</th>
                            <th className="pb-3 pr-4 font-semibold">Date</th>
                            <th className="pb-3 pr-4 font-semibold">Status</th>
                            <th className="pb-3 text-right font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                    No orders yet
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="text-secondary transition-colors hover:bg-muted/50">
                                    <td className="py-3 pr-4 font-semibold text-brand">#{order.id}</td>
                                    <td className="py-3 pr-4 whitespace-nowrap">{order.customerName}</td>
                                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                        {order.branchName}
                                    </td>
                                    <td
                                        className="max-w-[200px] py-3 pr-4 text-muted-foreground"
                                        title={order.items}
                                    >
                                        <span className="line-clamp-2">{order.items}</span>
                                    </td>
                                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                        {order.date}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="py-3 text-right font-semibold whitespace-nowrap">
                                        {formatTotal(order.total)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
};

export default RecentOrdersTable;