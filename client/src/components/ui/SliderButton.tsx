import type { Swiper as SwiperType } from "swiper";
import { SLIDER_CLASS_NAME } from "../../styles";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface SliderButtonProps {
    swiper: SwiperType | null;
    direction: 'left' | 'right';
    isBeginning?: boolean;
    isEnd?: boolean;
}

const SliderButton = ({ swiper, direction, isBeginning, isEnd }: SliderButtonProps) => {
    const isDisabled = direction === 'left' ? isBeginning : isEnd;
    return (
        <button
            onClick={() => direction === 'left' ? swiper?.slidePrev() : swiper?.slideNext()}
            className={`${SLIDER_CLASS_NAME(direction)} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
            aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
        >
            {direction === 'left' ?
                <ChevronLeftIcon className="w-7" /> :
                <ChevronRightIcon className="w-7" />}
        </button>)
}

export default SliderButton
