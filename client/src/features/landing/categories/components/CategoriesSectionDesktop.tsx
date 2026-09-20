import { Virtual } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from "swiper";
import SliderButton from '../../../../components/ui/SliderButton';
import { useState } from 'react';
import CategoryImg from "../../../../assets/mock-pics/category.webp";


const CategoriesSectionDesktop = () => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const slides = Array.from({ length: 1000 }).map(
        (_, index) => `Slide ${index + 1}`
    );


    return (
        <div className="hidden lg:block px-14 mx-14">
            <div className="relative">
                <SliderButton swiper={swiper} direction="left" isBeginning={isBeginning} />
                <SliderButton swiper={swiper} direction="right" isEnd={isEnd} />
                <Swiper
                    modules={[Virtual]}
                    spaceBetween={20}
                    slidesPerView={7}
                    onSwiper={(s) => {
                        setSwiper(s);
                        setIsBeginning(s.isBeginning);
                        setIsEnd(s.isEnd);
                    }}
                    onSlideChange={(s) => {
                        setIsBeginning(s.isBeginning);
                        setIsEnd(s.isEnd);
                    }}
                    virtual
                >
                    {slides.map((_, index) => (
                        <SwiperSlide key={index} virtualIndex={index}>
                            <div className="aspect-square overflow-hidden rounded-xl cursor-pointer">
                                <img src={CategoryImg} alt="Category Image" className="w-full h-full object-cover" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>)
}

export default CategoriesSectionDesktop
