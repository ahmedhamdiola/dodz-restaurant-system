interface SectionHeadingProps {
    title: string;
    countLabel: string;
}

const SectionHeading = ({ title, countLabel }: SectionHeadingProps) => {
    return (
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold uppercase tracking-tight text-secondary sm:text-xl">
                {title}
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {countLabel}
            </span>
        </div>
    );
};

export default SectionHeading;