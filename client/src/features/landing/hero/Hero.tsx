import Carousel from "../../../components/ui/carousel/Carousel";
import { heroSlides } from "../../../data";
import HeroMockSlide from "./HeroMockSlide";

const Hero = () => {
    return (
        <Carousel
            slides={heroSlides}
            renderSlide={HeroMockSlide}
            className="carousel-hero"
        />
    );
};

export default Hero;
