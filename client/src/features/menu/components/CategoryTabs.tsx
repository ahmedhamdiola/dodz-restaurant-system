import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MENU_CATEGORIES } from "../data";

interface CategoryTabsProps {
    activeSlug?: string;
}

const baseClass =
    "whitespace-nowrap rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-colors duration-200 cursor-pointer";

const CategoryTabs = ({ activeSlug }: CategoryTabsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const allActive = !activeSlug || activeSlug === "all";

    useEffect(() => {
        const container = scrollRef.current;
        const active = container?.querySelector('[aria-current="page"]');
        if (!container || !active) return;

        const activeRect = active.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const target =
            container.scrollLeft +
            activeRect.left -
            containerRect.left -
            (containerRect.width - activeRect.width) / 2;

        container.scrollTo({ left: target, behavior: "smooth" });
    }, [activeSlug]);

    return (
        <div className="sticky top-[132px] z-10 -mx-5 bg-primary/95 px-5 py-2 backdrop-blur-sm lg:top-20 lg:mx-0 lg:px-0">
            <div
                ref={scrollRef}
                className="scrollbar-hide flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:justify-center lg:overflow-visible"
            >
                <Link
                    to="/menu"
                    className={`${baseClass} ${allActive
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-card text-secondary hover:border-brand/50"
                        }`}
                >
                    All
                </Link>
                {MENU_CATEGORIES.map((category) => {
                    const isActive = activeSlug === category.slug;
                    return (
                        <Link
                            key={category.slug}
                            to={`/menu/${category.slug}`}
                            aria-current={isActive ? "page" : undefined}
                            className={`${baseClass} ${isActive
                                ? "border-brand bg-brand text-white"
                                : "border-border bg-card text-secondary hover:border-brand/50"
                                }`}
                        >
                            {category.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(CategoryTabs);