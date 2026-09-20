import type { AdminOrder } from "../types";
import DashboardCard, { TextLink } from "./DashboardCard";
import StatusBadge from "./StatusBadge";

interface RecentOrdersTableProps {
    orders: AdminOrder[];
}

const formatTotal = (total: number) =>
    `EGP ${total.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
    return (
        <DashboardCard
            title="Recent Orders"
            subtitle="Latest activity across all branches"
            action={<TextLink to="/admin/orders">View all</TextLink>}
        >
            <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[560px] text-sm">
                    <thead>
                        <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <th className="pb-3 pr-4 font-semibold">Order</th>
                            <th className="pb-3 pr-4 font-semibold">Customer</th>
                            <th className="pb-3 pr-4 font-semibold">Items</th>
                            <th className="pb-3 pr-4 font-semibold">Date</th>
                            <th className="pb-3 pr-4 font-semibold">Status</th>
                            <th className="pb-3 text-right font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="text-secondary transition-colors hover:bg-muted/50">
                                <td className="py-3 pr-4 font-semibold text-brand">{order.id}</td>
                                <td className="py-3 pr-4 whitespace-nowrap">{order.customer}</td>
                                <td className="max-w-[200px] truncate py-3 pr-4 text-muted-foreground">
                                    {order.items}
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
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
};

export default RecentOrdersTable;