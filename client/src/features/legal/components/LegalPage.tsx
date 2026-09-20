import { Helmet } from "react-helmet-async";
import type { LegalSection } from "../types";

interface LegalPageProps {
    title: string;
    description: string;
    lastUpdated: string;
    introduction: string;
    sections: LegalSection[];
}

const LegalPage = ({ title, description, lastUpdated, introduction, sections }: LegalPageProps) => {
    return (
        <>
            <Helmet>
                <title>{title} | DODZ Fried Chicken</title>
                <meta name="description" content={description} />
            </Helmet>
            <div className="bg-primary px-5 py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <header className="flex flex-col items-center gap-2 text-center">
                        <h1 className="border-b-2 border-red-600 pb-1 text-2xl font-bold uppercase tracking-tight text-secondary sm:text-3xl">
                            {title}
                        </h1>
                        <p className="text-xs font-semibold uppercase text-muted-foreground sm:text-sm">
                            Last updated: {lastUpdated}
                        </p>
                    </header>

                    <article className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-md sm:p-8 lg:p-10">
                        <p className="text-sm leading-relaxed text-secondary/80 sm:text-[15px]">
                            {introduction}
                        </p>

                        <div className="mt-8 flex flex-col gap-8">
                            {sections.map((section) => (
                                <section key={section.title}>
                                    <h2 className="flex items-center gap-2.5 text-base font-bold uppercase text-secondary sm:text-lg">
                                        <span className="h-5 w-1 shrink-0 rounded-full bg-brand" />
                                        {section.title}
                                    </h2>
                                    <div className="mt-3 flex flex-col gap-3">
                                        {section.paragraphs.map((paragraph, index) => (
                                            <p
                                                key={index}
                                                className="text-sm leading-relaxed text-secondary/80 sm:text-[15px]"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                        {section.bullets && (
                                            <ul className="mt-1 flex flex-col gap-2">
                                                {section.bullets.map((bullet, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2.5 text-sm leading-relaxed text-secondary/80 sm:text-[15px]"
                                                    >
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70" />
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
};

export default LegalPage;