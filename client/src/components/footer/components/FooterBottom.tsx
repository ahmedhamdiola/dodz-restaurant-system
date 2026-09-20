import { Link } from "react-router-dom"
import { FOOTER_LEGAL_LINKS } from "../data"

const FooterBottom = () => {
    return (
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
            <p className="text-xs text-white/50">
                © {new Date().getFullYear()} DODZ Fried Chicken. All rights
                reserved.
            </p>
            <div className="flex items-center gap-6">
                {FOOTER_LEGAL_LINKS.map(({ label, href }) => (
                    <Link
                        key={label}
                        to={href}
                        className="text-xs text-white/50 transition-colors duration-200 hover:text-white"
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default FooterBottom