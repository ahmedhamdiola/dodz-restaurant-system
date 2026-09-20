import { Helmet } from "react-helmet-async";
import Hero from "../../features/landing/hero/Hero";
import CategoriesSection from "../../features/landing/categories/CategoriesSection";
import { TopDeals } from "../../features/landing/top-deals/TopDeals";
import GallerySection from "../../features/landing/gallery/GallerySection";


const LandingPage = () => {

    return (
        <>
            <Helmet>
                <title>Home | DODZ Fried Chicken</title>
                <meta
                    name="description"
                    content="DODZ Fried Chicken is a restaurant that serves fried chicken with premium quality for everyone."
                />
            </Helmet>
            <div className="bg-primary px-5 py-10">
                <Hero />
                <CategoriesSection />
                <TopDeals />
                <GallerySection />
            </div>
        </>
    )
}

export default LandingPage
