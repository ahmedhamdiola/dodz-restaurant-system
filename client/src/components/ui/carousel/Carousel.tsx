import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { ReactNode } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CarouselProps<T> {
    slides: T[];
    renderSlide: (slide: T, index: number) => ReactNode;
    className?: string;
    autoplayDelay?: number;
    loop?: boolean;
    speed?: number;
    spaceBetween?: number;
    slidesPerView?: number;
    navigation?: boolean;
    pagination?: boolean;
}

const Carousel = <T,>({
    slides,
    renderSlide,
    className,
    autoplayDelay = 3000,
    loop = true,
    speed = 700,
    spaceBetween = 0,
    slidesPerView = 1,
    navigation = true,
    pagination = true,
}: CarouselProps<T>) => {
    return (
        <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={spaceBetween}
            slidesPerView={slidesPerView}
            loop={loop}
            speed={speed}
            grabCursor
            autoplay={{
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            navigation={navigation}
            pagination={pagination ? { clickable: true } : false}
            className={className}
        >
            {slides.map((slide, index) => (
                <SwiperSlide key={index}>
                    {renderSlide(slide, index)}
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default Carousel;