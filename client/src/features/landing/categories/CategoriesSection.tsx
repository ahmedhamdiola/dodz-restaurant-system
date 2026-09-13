import CategoriesSectionMobile from './components/CategoriesSectionMobile';
import CategoriesSectionDesktop from './components/CategoriesSectionDesktop';

const CategoriesSection = () => {
    return (
        <div className="mt-15  flex flex-col gap-6">
            <h1 className="font-bold text-nowrap text-2xl uppercase tracking-tighter text-secondary lg:ml-14 border-b-2 pb-1 border-red-600 w-fit">Pick your feast</h1>
            <CategoriesSectionDesktop />
            <CategoriesSectionMobile />
        </div>
    )
}

export default CategoriesSection
