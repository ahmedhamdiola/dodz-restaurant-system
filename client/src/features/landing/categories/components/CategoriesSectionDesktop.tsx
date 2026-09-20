import { Virtual } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from "swiper";
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import SliderButton from '../../../../components/ui/SliderButton';
import { MENU_CATEGORIES } from '../../../menu/data';

const CategoriesSectionDesktop = () => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const handleSwiper = useCallback((instance: SwiperType) => {
        setSwiper(instance);
        setIsBeginning(instance.isBeginning);
        setIsEnd(instance.isEnd);
    }, []);

    const handleSlideChange = useCallback((instance: SwiperType) => {
        setIsBeginning(instance.isBeginning);
        setIsEnd(instance.isEnd);
    }, []);

    return (
        <div className="hidden lg:block px-14 mx-14">
            <div className="relative">
                <SliderButton swiper={swiper} direction="left" isBeginning={isBeginning} />
                <SliderButton swiper={swiper} direction="right" isEnd={isEnd} />
                <Swiper
                    modules={[Virtual]}
                    spaceBetween={20}
                    slidesPerView={7}
                    onSwiper={handleSwiper}
                    onSlideChange={handleSlideChange}
                    virtual
                >
                    {MENU_CATEGORIES.map((category, index) => (
                        <SwiperSlide key={category.slug} virtualIndex={index}>
                            <Link to={`/menu/${category.slug}`} className="group flex flex-col gap-2">
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <span className="text-center text-xs font-semibold uppercase tracking-wide text-secondary group-hover:text-brand transition-colors">
                                    {category.name}
                                </span>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>)
}

export default CategoriesSectionDesktop