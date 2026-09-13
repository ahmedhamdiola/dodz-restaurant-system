import CategoryImg from "../../../../assets/mock-pics/category.png";

const CategoriesSectionMobile = () => {
    return (
        <div className="grid grid-cols-3 gap-4 lg:hidden">
            {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-xl">
                    <img src={CategoryImg} alt="Category Image" className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    )
}

export default CategoriesSectionMobile
