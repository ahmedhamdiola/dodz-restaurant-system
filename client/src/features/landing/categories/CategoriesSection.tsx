import CategoriesSectionMobile from './components/CategoriesSectionMobile';
import CategoriesSectionDesktop from './components/CategoriesSectionDesktop';
import HeaderSection from '../../../components/ui/HeaderSection';

const CategoriesSection = () => {
    return (
        <div className="mt-15 flex flex-col gap-6">
            <HeaderSection title="Pick your feast" path="/OFFERS_ID" />
            <CategoriesSectionDesktop />
            <CategoriesSectionMobile />
        </div>
    )
}

export default CategoriesSection
