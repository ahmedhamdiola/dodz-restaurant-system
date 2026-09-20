import Logo from "../../../assets/logos/Logo.svg"
import { FOOTER_CONTACT, FOOTER_SOCIALS } from "../data"

const FooterBrand = () => {
    return (
        <div className="col-span-2 flex flex-col gap-6 lg:col-span-4 lg:pr-6">
            <img
                src={Logo}
                alt="DODZ Logo"
                className="w-28 lg:w-32 brightness-0 invert"
            />
            <p className="max-w-sm text-sm leading-relaxed text-white font-bold">
                Premium Flavor for Everyone.
            </p>
            <ul className="flex flex-col gap-3 text-sm">
                {FOOTER_CONTACT.map(({ label, value, href, Icon }) => (
                    <li key={label} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-brand" />
                        {href ? (
                            <a
                                href={href}
                                className="text-white/70 transition-colors duration-200 hover:text-white"
                            >
                                {value}
                            </a>
                        ) : (
                            <span className="text-white/70">{value}</span>
                        )}
                    </li>
                ))}
            </ul>
            <div className="flex gap-3">
                {FOOTER_SOCIALS.map(({ label, href, path }) => (
                    <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors duration-200 hover:border-brand hover:bg-brand hover:text-white"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                            <path d={path} />
                        </svg>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default FooterBrand