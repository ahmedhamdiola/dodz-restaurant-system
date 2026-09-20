import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import type { Stat } from "../types";

interface StatCardProps {
    stat: Stat;
    footer?: ReactNode;
}

const StatCard = ({ stat, footer }: StatCardProps) => {
    const isPositive = stat.change >= 0;

    return (
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                    </span>
                    <span className="mt-2 text-2xl font-bold tracking-tight text-secondary">
                        {stat.value}
                    </span>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <stat.Icon className="h-5 w-5" />
                </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                        isPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                >
                    {isPositive ? (
                        <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                    )}
                    {isPositive ? "+" : ""}
                    {stat.change}%
                </span>
                <span className="text-muted-foreground">{footer ?? "vs last week"}</span>
            </div>
        </article>
    );
};

export default StatCard;