import { Link } from 'react-router-dom';
import { MENU_CATEGORIES } from '../../../menu/data';

const CategoriesSectionMobile = () => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mx-auto w-full lg:hidden sm:gap-3">
            {MENU_CATEGORIES.map((category) => (
                <Link
                    key={category.slug}
                    to={`/menu/${category.slug}`}
                    className="group flex flex-col gap-2"
                >
                    <div className="aspect-square overflow-hidden rounded-xl cursor-pointer">
                        <img
                            src={category.image}
                            alt={category.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <span className="text-center text-[11px] font-semibold uppercase tracking-wide text-secondary group-hover:text-brand transition-colors">
                        {category.name}
                    </span>
                </Link>
            ))}
        </div>
    )
}

export default CategoriesSectionMobile