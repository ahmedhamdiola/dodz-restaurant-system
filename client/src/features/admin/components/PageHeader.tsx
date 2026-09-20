import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-secondary sm:text-2xl">
                {title}
            </h1>
            {subtitle && (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
            )}
        </div>
        {action}
    </div>
);

export default PageHeader;