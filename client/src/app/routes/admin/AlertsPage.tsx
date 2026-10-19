import { useState } from "react";
import { BellAlertIcon, CheckIcon, EyeIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../features/admin/components/PageHeader";
import StatusBadge from "../../../features/admin/components/StatusBadge";
import { useAdminAlerts, useUpdateAlertStatus } from "../../../features/admin/hooks/useAdminAlerts";
import { useBranches } from "../../../features/admin/hooks/useDashboardData";
import { ALERT_TYPE_LABELS, type BranchAlertStatus } from "../../../features/branch/types";

const FILTERS: Array<{ value: BranchAlertStatus | "all"; label: string }> = [
    { value: "pending", label: "Pending" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "resolved", label: "Resolved" },
    { value: "all", label: "All" },
];

const STATUS_LABELS: Record<BranchAlertStatus, string> = {
    pending: "Pending",
    acknowledged: "Acknowledged",
    resolved: "Resolved",
};

const formatWhen = (value: string) =>
    new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

const AlertsPage = () => {
    const [status, setStatus] = useState<BranchAlertStatus | "all">("pending");
    const [branchId, setBranchId] = useState<number | "all">("all");

    const { data: alerts = [], isLoading, isError, refetch } = useAdminAlerts({
        status: status === "all" ? undefined : status,
        branchId: branchId === "all" ? undefined : branchId,
    });
    const { data: branches = [] } = useBranches();
    const updateStatus = useUpdateAlertStatus();

    return (
        <div>
            <PageHeader title="Branch Alerts" subtitle="What the branches are reporting right now." />

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setStatus(filter.value)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                    status === filter.value
                                        ? "bg-brand text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={branchId}
                        onChange={(event) =>
                            setBranchId(event.target.value === "all" ? "all" : Number(event.target.value))
                        }
                        className="ml-auto cursor-pointer rounded-lg border border-border bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    >
                        <option value="all">All branches</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="h-14 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <p className="text-sm text-muted-foreground">Couldn't load alerts.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                        >
                            Retry
                        </button>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                        <BellAlertIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Nothing here — no {status === "all" ? "" : `${STATUS_LABELS[status].toLowerCase()} `}alerts.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {alerts.map((alert) => (
                            <li
                                key={alert.id}
                                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                            {ALERT_TYPE_LABELS[alert.type]}
                                        </span>
                                        <span className="text-sm font-semibold text-secondary">
                                            {alert.branchName}
                                        </span>
                                    </div>
                                    <p className="text-sm text-secondary">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {alert.senderName ?? "Former account"} · {formatWhen(alert.createdAt)}
                                        {alert.acknowledgedByName && (
                                            <> · picked up by {alert.acknowledgedByName}</>
                                        )}
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <StatusBadge status={STATUS_LABELS[alert.status]} />
                                    {alert.status === "pending" && (
                                        <button
                                            type="button"
                                            disabled={updateStatus.isPending}
                                            onClick={() => updateStatus.mutate({ id: alert.id, status: "acknowledged" })}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                                        >
                                            <EyeIcon className="h-3.5 w-3.5" />
                                            Acknowledge
                                        </button>
                                    )}
                                    {alert.status !== "resolved" && (
                                        <button
                                            type="button"
                                            disabled={updateStatus.isPending}
                                            onClick={() => updateStatus.mutate({ id: alert.id, status: "resolved" })}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        >
                                            <CheckIcon className="h-3.5 w-3.5" />
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
