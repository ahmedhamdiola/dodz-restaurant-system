import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CONTACT_INFO } from "../data";
import ContactSocials from "./ContactSocials";

const ContactInfo = () => {
    const renderValue = (href: string | undefined, value: string): ReactNode => {
        if (!href) return <span className="text-secondary/80">{value}</span>;
        const isExternal = href.startsWith("http");
        if (isExternal) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-secondary/80 transition-colors hover:text-brand"
                >
                    {value}
                    <ArrowTopRightOnSquareIcon className="w-3.5 shrink-0" />
                </a>
            );
        }
        return (
            <Link
                to={href}
                className="inline-flex max-w-fit items-center gap-1 text-secondary/80 transition-colors hover:text-brand"
            >
                {value}
                <ArrowTopRightOnSquareIcon className="w-3.5 shrink-0" />
            </Link>
        );
    };

    return (
        <aside className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-md sm:p-7">
            <h2 className="text-lg font-bold uppercase tracking-tight text-secondary">
                Get in touch
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
                We'd love to hear from you. Reach out through any of the channels below or drop
                by your nearest DODZ branch.
            </p>

            <ul className="mt-2 flex flex-col gap-4">
                {CONTACT_INFO.map(({ label, value, href, Icon }) => (
                    <li key={label} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <Icon className="w-5" />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {label}
                            </span>
                            <span className="text-sm font-semibold text-secondary">
                                {renderValue(href, value)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <ContactSocials />
        </aside>
    );
};

export default ContactInfo;