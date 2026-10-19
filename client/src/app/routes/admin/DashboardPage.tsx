import { useMemo, useState } from "react";
import {
    BanknotesIcon,
    ClipboardDocumentCheckIcon,
    ClipboardDocumentListIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import BranchFilter from "../../../features/admin/components/BranchFilter";
import DashboardCard from "../../../features/admin/components/DashboardCard";
import OrderStatusDonut from "../../../features/admin/components/OrderStatusDonut";
import RecentOrdersTable from "../../../features/admin/components/RecentOrdersTable";
import PendingAlertsPanel from "../../../features/admin/components/PendingAlertsPanel";
import RevenueChart from "../../../features/admin/components/RevenueChart";
import StatCard from "../../../features/admin/components/StatCard";
import TopProducts from "../../../features/admin/components/TopProducts";
import {
    useBranches,
    useOrderStats,
    useOrdersCountByBranch,
} from "../../../features/admin/hooks/useDashboardData";
import type { RevenuePoint, Stat } from "../../../features/admin/types";

const formatMoney = (value: number) => `EGP ${Math.round(value).toLocaleString("en-US")}`;
const formatCount = (value: number) => value.toLocaleString("en-US");

const computeRevenueChange = (points: RevenuePoint[]): number => {
    if (points.length < 6) return 0;
    const recent = points.slice(-3).reduce((sum, point) => sum + point.revenue, 0);
    const previous = points.slice(-6, -3).reduce((sum, point) => sum + point.revenue, 0);
    if (previous <= 0) return 0;
    return ((recent - previous) / previous) * 100;
};

const LoadingCard = ({ span = "" }: { span?: string }) => (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${span}`}>
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-32 animate-pulse rounded bg-muted" />
    </div>
);

const DashboardPage = () => {
    const { data: branches = [] } = useBranches();
    const { data: counts = [] } = useOrdersCountByBranch();
    const [branchId, setBranchId] = useState<number | undefined>(undefined);
    const { data: stats, isLoading, isError, refetch } = useOrderStats(branchId);

    const activeBranch = branches.find((branch) => branch.id === branchId);
    const scope = activeBranch?.name ?? "All branches";

    const statCards = useMemo<Stat[]>(() => {
        if (!stats) return [];
        return [
            {
                label: "Total Revenue",
                value: formatMoney(stats.totalRevenue),
                change: computeRevenueChange(stats.revenueLast7Days),
                Icon: BanknotesIcon,
            },
            {
                label: "Orders Today",
                value: formatCount(stats.ordersToday),
                change: 0,
                Icon: ClipboardDocumentListIcon,
            },
            {
                label: "Avg Order Value",
                value: formatMoney(stats.avgOrderValue),
                change: 0,
                Icon: ShoppingBagIcon,
            },
            {
                label: "Total Orders",
                value: formatCount(stats.orderCount),
                change: 0,
                Icon: ClipboardDocumentCheckIcon,
            },
        ];
    }, [stats]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-secondary sm:text-2xl">
                    Dashboard
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    Live overview for {scope.toLowerCase()}
                </p>
            </div>

            <BranchFilter branches={branches} counts={counts} selectedId={branchId} onSelect={setBranchId} />

            <PendingAlertsPanel />

            {isError ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-14 text-center">
                    <p className="text-sm text-muted-foreground">Couldn't load dashboard stats.</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        Retry
                    </button>
                </div>
            ) : isLoading || !stats ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => (
                        <LoadingCard key={index} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((stat) => (
                            <StatCard key={stat.label} stat={stat} footer={`· ${scope}`} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <DashboardCard
                            title="Revenue"
                            subtitle={`Last 7 days · ${scope.toLowerCase()}`}
                            className="lg:col-span-2"
                        >
                            <BranchFilter
                                branches={branches}
                                counts={counts}
                                selectedId={branchId}
                                onSelect={setBranchId}
                                compact
                            />
                            <RevenueChart data={stats.revenueLast7Days} />
                        </DashboardCard>

                        <DashboardCard title="Order Status" subtitle="Live split of today's orders">
                            <OrderStatusDonut slices={stats.statusSlices} />
                        </DashboardCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <RecentOrdersTable orders={stats.recentOrders} scope={scope} />
                        </div>
                        <TopProducts products={stats.topProducts} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;