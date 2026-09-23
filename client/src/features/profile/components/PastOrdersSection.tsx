import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import StatusBadge from "../../admin/components/StatusBadge";
import ErrorAlert from "../../auth/components/ErrorAlert";
import { formatPrice } from "../../../lib/format";
import type { PastOrder } from "../types";
import SectionHeading from "./SectionHeading";

interface PastOrdersSectionProps {
    orders: PastOrder[];
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

const countLabel = (count: number): string => `${count} ${count === 1 ? "order" : "orders"}`;

const OrderSkeleton = () => (
    <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-3 w-full rounded bg-muted" />
        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <div className="h-3 w-10 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
        </div>
    </div>
);

const PastOrdersSection = ({
    orders,
    isLoading = false,
    isError = false,
    onRetry,
}: PastOrdersSectionProps) => {
    if (isLoading) {
        return (
            <section className="flex flex-col gap-4">
                <SectionHeading title="Past Orders" countLabel="Loading…" />
                <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading past orders">
                    <OrderSkeleton />
                    <OrderSkeleton />
                    <OrderSkeleton />
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex flex-col gap-4">
                <SectionHeading title="Past Orders" countLabel="Unavailable" />
                <div className="rounded-2xl border border-border bg-card p-5">
                    <ErrorAlert message="We couldn't load your past orders." />
                    {onRetry !== undefined && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </section>
        );
    }

    if (orders.length === 0) {
        return (
            <section className="flex flex-col gap-4">
                <SectionHeading title="Past Orders" countLabel="0 orders" />
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <ShoppingBagIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="max-w-xs text-sm text-muted-foreground">
                        No orders yet — your orders will appear here.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-4">
            <SectionHeading title="Past Orders" countLabel={countLabel(orders.length)} />
            <ol className="flex flex-col gap-3">
                {orders.map((order) => (
                    <li key={order.id}>
                        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-secondary">
                                        Order #{order.id}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {order.date} · {order.branchName}
                                    </p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                {order.items}
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Total
                                </span>
                                <span className="text-base font-bold text-secondary">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </article>
                    </li>
                ))}
            </ol>
        </section>
    );
};

export default PastOrdersSection;