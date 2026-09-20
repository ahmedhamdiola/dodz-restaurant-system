import type { LegalSection } from "./types";

export const PRIVACY_INTRO =
    "At DODZ Fried Chicken, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data.";

export const PRIVACY_SECTIONS: LegalSection[] = [
    {
        title: "1. Information We Collect",
        paragraphs: [
            "Information you provide directly: When you place an order, create an account, contact us, or participate in a promotion, we may collect your name, email address, phone number, delivery address, order history, and payment information.",
            "Information collected automatically: When you visit our website, we may automatically collect certain technical information, such as your IP address, browser type, device type, pages visited, and time spent on our website.",
            "Information from third parties: We may receive information about you from payment providers and delivery partners when needed to process and fulfill your orders.",
        ],
    },
    {
        title: "2. How We Use Your Information",
        paragraphs: [
            "We use the information we collect to process and fulfill your orders, including preparing food, arranging delivery, and processing payments.",
            "We also use your information to communicate with you about your orders, respond to inquiries, provide customer support, and send important service updates.",
            "With your consent, we may send you promotional communications about new menu items, offers, and events. You can opt out at any time.",
            "We use aggregated and anonymized information to analyze trends, improve our menu and services, and maintain the security of our website.",
        ],
    },
    {
        title: "3. Cookies and Similar Technologies",
        paragraphs: [
            "Our website uses cookies and similar tracking technologies to remember your preferences, understand how our website is used, and improve your experience.",
            "You can control or disable cookies through your browser settings. Please note that some features of our website may not function properly if cookies are disabled.",
        ],
    },
    {
        title: "4. Sharing of Information",
        paragraphs: [
            "We do not sell your personal information. We only share your information with trusted third parties who help us operate, such as payment processors, delivery partners, and analytics providers, and only to the extent necessary to provide our services.",
            "We may also disclose your information where required by law, by court order, or to protect the rights, property, or safety of DODZ, our customers, or others.",
        ],
    },
    {
        title: "5. Data Retention and Security",
        paragraphs: [
            "We retain your personal information only for as long as necessary to fulfill the purposes described in this Policy, comply with legal obligations, and resolve disputes.",
            "We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
        ],
    },
    {
        title: "6. Your Rights and Choices",
        paragraphs: ["Depending on where you live, you may have the right to:"],
        bullets: [
            "Access and obtain a copy of the personal information we hold about you;",
            "Request correction of inaccurate or incomplete information;",
            "Request deletion of your personal information, subject to legal and contractual obligations;",
            "Object to or restrict certain processing of your personal information;",
            "Opt out of marketing communications at any time.",
        ],
    },
    {
        title: "7. Children's Privacy",
        paragraphs: [
            "Our website and services are intended for users who are at least 18 years old. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.",
        ],
    },
    {
        title: "8. Third-Party Links",
        paragraphs: [
            "Our website may contain links to external websites, such as our social media pages and third-party services. We are not responsible for the privacy practices or content of these external websites. We encourage you to review the privacy policies of any third-party websites you visit.",
        ],
    },
    {
        title: "9. Changes to This Policy",
        paragraphs: [
            "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last updated' date at the top of this page. We encourage you to review this Policy periodically.",
        ],
    },
    {
        title: "10. Contact Us",
        paragraphs: [
            "If you have any questions about this Privacy Policy or how we handle your data, please contact us at our hotline 16974 or by email at care@dodzfriedchicken.com.",
        ],
    },
];