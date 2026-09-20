import CategoryImg from "../../../../assets/mock-pics/category.webp";

const CategoriesSectionMobile = () => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mx-auto w-full lg:hidden sm:gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-xl cursor-pointer">
                    <img src={CategoryImg} alt="Category Image" className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    )
}

export default CategoriesSectionMobile
