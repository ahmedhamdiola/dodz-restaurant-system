import LegalPage from "../../features/legal/components/LegalPage";
import { TERMS_INTRO, TERMS_SECTIONS } from "../../features/legal/terms";

const TermsPage = () => {
    return (
        <LegalPage
            title="Terms & Conditions"
            description="Read the Terms & Conditions that govern your use of the DODZ Fried Chicken website, orders, promotions, and services."
            lastUpdated="September 20, 2026"
            introduction={TERMS_INTRO}
            sections={TERMS_SECTIONS}
        />
    );
};

export default TermsPage;