import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface DashboardCardProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

const DashboardCard = ({ title, subtitle, action, children, className = "" }: DashboardCardProps) => (
    <section className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
        <header className="mb-4 flex items-start justify-between gap-3">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-secondary">{title}</h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {action}
        </header>
        {children}
    </section>
);

export const TextLink = ({ to, children }: { to: string; children: ReactNode }) => (
    <Link
        to={to}
        className="text-xs font-semibold uppercase tracking-wide text-brand transition-opacity hover:opacity-80"
    >
        {children}
    </Link>
);

export default DashboardCard;