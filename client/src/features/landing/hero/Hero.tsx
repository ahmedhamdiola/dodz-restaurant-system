import Carousel from "../../../components/ui/carousel/Carousel";
import { HERO_SLIDES } from "./data";
import HeroMockSlide from "./HeroMockSlide";

const Hero = () => {
    return (
        <Carousel
            slides={HERO_SLIDES}
            renderSlide={HeroMockSlide}
            className="carousel-hero"
        />
    );
};

export default Hero;
