import { DASHBOARD_STATS, ORDER_STATUS_SLICES, RECENT_ORDERS, REVENUE_LAST_7_DAYS, TOP_PRODUCTS } from "../data";
import DashboardCard from "../components/DashboardCard";
import OrderStatusDonut from "../components/OrderStatusDonut";
import RecentOrdersTable from "../components/RecentOrdersTable";
import RevenueChart from "../components/RevenueChart";
import StatCard from "../components/StatCard";
import TopProducts from "../components/TopProducts";

const DashboardPage = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {DASHBOARD_STATS.map((stat) => (
                    <StatCard key={stat.label} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <DashboardCard
                    title="Revenue"
                    subtitle="Last 7 days · all branches combined"
                    className="lg:col-span-2"
                >
                    <RevenueChart data={REVENUE_LAST_7_DAYS} />
                </DashboardCard>

                <DashboardCard title="Order Status" subtitle="Live split of today's orders">
                    <OrderStatusDonut slices={ORDER_STATUS_SLICES} />
                </DashboardCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentOrdersTable orders={RECENT_ORDERS} />
                </div>
                <TopProducts products={TOP_PRODUCTS} />
            </div>
        </div>
    );
};

export default DashboardPage;