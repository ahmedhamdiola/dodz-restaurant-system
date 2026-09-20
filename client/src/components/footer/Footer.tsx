import FooterBrand from "./components/FooterBrand"
import FooterBottom from "./components/FooterBottom"
import FooterColumn from "./components/FooterColumn"
import { FOOTER_COLUMNS } from "./data"

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-[#0e1014] dark:bg-[#0b0d10]">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
                    <FooterBrand />
                    {FOOTER_COLUMNS.map((column) => (
                        <FooterColumn key={column.title} data={column} />
                    ))}
                </div>
                <FooterBottom />
            </div>
        </footer>
    )
}

export default Footer