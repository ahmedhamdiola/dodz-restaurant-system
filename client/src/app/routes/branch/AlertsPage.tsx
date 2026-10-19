import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import StatusBadge from "../../../features/admin/components/StatusBadge";
import { useAlerts, useSendAlert } from "../../../features/branch/hooks/useBranchAlerts";
import {
    ALERT_TYPE_LABELS,
    type BranchAlertStatus,
    type BranchAlertType,
} from "../../../features/branch/types";

const TYPES: Array<{ value: BranchAlertType; hint: string }> = [
    { value: "needs_stock", hint: "We are running out of something." },
    { value: "busy", hint: "We are slammed right now." },
    { value: "other", hint: "Anything else the office should know." },
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
    const { data: alerts = [], isLoading } = useAlerts();
    const sendAlert = useSendAlert();

    const [selectedType, setSelectedType] = useState<BranchAlertType>("needs_stock");
    const [message, setMessage] = useState("");

    const trimmedMessage = message.trim();
    const canSend = trimmedMessage.length > 0 && !sendAlert.isPending;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSend) return;
        sendAlert.mutate(
            { type: selectedType, message: trimmedMessage },
            { onSuccess: () => setMessage("") },
        );
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <form onSubmit={handleSubmit} className="h-fit rounded-xl border border-border bg-card p-4 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wide text-secondary">Report to head office</h2>
                <p className="mt-1 text-xs text-muted-foreground">Pick a type, add a line, send it.</p>

                <div className="mt-4 space-y-2">
                    {TYPES.map((option) => (
                        <label
                            key={option.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                selectedType === option.value
                                    ? "border-brand bg-brand/5"
                                    : "border-border hover:bg-muted/40"
                            }`}
                        >
                            <input
                                type="radio"
                                name="alert-type"
                                value={option.value}
                                checked={selectedType === option.value}
                                onChange={() => setSelectedType(option.value)}
                                className="mt-0.5 accent-brand"
                            />
                            <span className="flex flex-col">
                                <span className="text-sm font-semibold text-secondary">
                                    {ALERT_TYPE_LABELS[option.value]}
                                </span>
                                <span className="text-xs text-muted-foreground">{option.hint}</span>
                            </span>
                        </label>
                    ))}
                </div>

                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="e.g. We are down to the last tray of chicken shawarma."
                    className="mt-3 w-full resize-none rounded-lg border border-border bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />

                <button
                    type="submit"
                    disabled={!canSend}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {sendAlert.isPending ? "Sending…" : "Send to head office"}
                </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <h2 className="border-b border-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Alerts you sent
                </h2>

                {isLoading ? (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <p className="p-10 text-center text-sm text-muted-foreground">
                        You have not sent any alerts yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-border">
                        {alerts.map((alert) => (
                            <li key={alert.id} className="flex flex-col gap-2 p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                        {ALERT_TYPE_LABELS[alert.type]}
                                    </span>
                                    <StatusBadge status={STATUS_LABELS[alert.status]} />
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {formatWhen(alert.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary">{alert.message}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
