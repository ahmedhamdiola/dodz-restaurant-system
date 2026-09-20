import { FOOTER_SOCIALS } from "../../../components/footer/data";

const ContactSocials = () => {
    return (
        <div className="mt-2 border-t border-border pt-5">
            <h3 className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chat With Us on Social Media
            </h3>
            <div className="mt-3 flex justify-center gap-3">
                {FOOTER_SOCIALS.map(({ label, href, path }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit our ${label} page`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                            <path d={path} />
                        </svg>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ContactSocials;
