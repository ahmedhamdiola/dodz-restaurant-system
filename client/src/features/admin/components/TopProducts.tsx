import type { TopProduct } from "../types";
import DashboardCard, { TextLink } from "./DashboardCard";

interface TopProductsProps {
    products: TopProduct[];
}

const formatMoney = (value: number) =>
    value >= 1_000_000
        ? `EGP ${(value / 1_000_000).toFixed(1)}M`
        : `EGP ${(value / 1_000).toFixed(0)}k`;

const TopProducts = ({ products }: TopProductsProps) => {
    const maxShare = Math.max(...products.map((product) => product.share));

    return (
        <DashboardCard
            title="Top Products"
            subtitle="Best sellers by units sold"
            action={<TextLink to="/admin/products">Products</TextLink>}
        >
            <ul className="flex flex-col gap-4">
                {products.map((product) => (
                    <li key={product.name} className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate font-medium text-secondary">
                                {product.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {product.sold.toLocaleString("en-US")} sold
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500"
                                    style={{
                                        width: `${(product.share / maxShare) * 100}%`,
                                    }}
                                />
                            </div>
                            <span className="w-16 shrink-0 text-right text-xs font-semibold text-secondary">
                                {formatMoney(product.revenue)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};

export default TopProducts;