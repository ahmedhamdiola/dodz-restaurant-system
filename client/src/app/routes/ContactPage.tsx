import { Helmet } from "react-helmet-async";
import ContactForm from "../../features/contact/components/ContactForm";
import ContactInfo from "../../features/contact/components/ContactInfo";

const ContactPage = () => {
    return (
        <>
            <Helmet>
                <title>Contact Us | DODZ Fried Chicken</title>
                <meta
                    name="description"
                    content="Get in touch with DODZ Fried Chicken. Send us a message, call our hotline 16974, or find your nearest branch."
                />
            </Helmet>
            <div className="bg-primary px-5 py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <header className="flex flex-col items-center gap-2 text-center">
                        <h1 className="border-b-2 border-red-600 pb-1 text-2xl font-bold uppercase tracking-tighter text-secondary sm:text-3xl lg:text-4xl">
                            Contact Us
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                            Have a question, feedback, or a craving? Send us a message and we'll
                            get back to you as soon as possible.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <ContactForm />
                        </div>
                        <div className="lg:col-span-2">
                            <ContactInfo />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;