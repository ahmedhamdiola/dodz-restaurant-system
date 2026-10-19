import { Link } from "react-router-dom";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { useAdminAlerts } from "../hooks/useAdminAlerts";
import { ALERT_TYPE_LABELS } from "../../branch/types";

const formatWhen = (value: string) =>
    new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

const PendingAlertsPanel = () => {
    const { data: alerts = [], isLoading } = useAdminAlerts({ status: "pending" });

    if (!isLoading && alerts.length === 0) {
        return null;
    }

    return (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-secondary">
                    Branch alerts
                    {!isLoading && (
                        <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {alerts.length}
                        </span>
                    )}
                </h2>
                <Link
                    to="/admin/alerts"
                    className="ml-auto text-xs font-semibold uppercase tracking-wide text-brand hover:underline"
                >
                    View all
                </Link>
            </div>

            {isLoading ? (
                <div className="mt-3 space-y-2">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                </div>
            ) : (
                <ul className="mt-3 space-y-2">
                    {alerts.slice(0, 3).map((alert) => (
                        <li
                            key={alert.id}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm"
                        >
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                {ALERT_TYPE_LABELS[alert.type]}
                            </span>
                            <span className="font-semibold text-secondary">{alert.branchName}</span>
                            <span className="min-w-0 flex-1 truncate text-muted-foreground">{alert.message}</span>
                            <span className="text-xs text-muted-foreground">{formatWhen(alert.createdAt)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default PendingAlertsPanel;
