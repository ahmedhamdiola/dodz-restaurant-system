import Cover1 from "../../../assets/mock-pics/cover1.webp";
import Cover2 from "../../../assets/mock-pics/cover2.webp";

const covers = [
    { src: Cover1, alt: "DODZ crispy fried chicken bucket" },
    { src: Cover2, alt: "DODZ chicken meal with sides and dipping sauce" },
];

const GallerySection = () => {
    return (
        <div className="mt-15 flex flex-col gap-6">
            <div className="mx-auto lg:ml-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
                {covers.map(({ src, alt }) => (
                    <div
                        key={src}
                        className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
                    >
                        <img
                            className="h-70 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            src={src}
                            alt={alt}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GallerySection;