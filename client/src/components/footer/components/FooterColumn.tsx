import { Link } from "react-router-dom"
import type { FooterColumnData } from "../data"

const FooterColumn = ({ data }: { data: FooterColumnData }) => {
    return (
        <div className="min-w-0 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
                {data.title}
            </h3>
            <ul className="mt-5 space-y-3">
                {data.links.map(({ label, href }) => (
                    <li key={label}>
                        <Link
                            to={href}
                            className="text-sm text-white/70 transition-colors duration-200 hover:text-brand"
                        >
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default FooterColumn