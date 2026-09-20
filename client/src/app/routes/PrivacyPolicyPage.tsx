import LegalPage from "../../features/legal/components/LegalPage";
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "../../features/legal/privacy";

const PrivacyPolicyPage = () => {
    return (
        <LegalPage
            title="Privacy Policy"
            description="Learn how DODZ Fried Chicken collects, uses, and protects your personal information when you use our website and services."
            lastUpdated="September 20, 2026"
            introduction={PRIVACY_INTRO}
            sections={PRIVACY_SECTIONS}
        />
    );
};

export default PrivacyPolicyPage;