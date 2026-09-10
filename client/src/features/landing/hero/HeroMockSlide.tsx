interface HeroMockSlideProps {
    eyebrow: string,
    title: string,
    description: string,
    cta: string,
    gradient: string,
}
const HeroMockSlide = ({ eyebrow, title, description, cta, gradient }: HeroMockSlideProps) => {
    return (
        <div
            className={`relative flex h-[320px] w-full items-center overflow-hidden bg-gradient-to-br sm:h-[420px] lg:h-[520px] ${gradient}`}
        >
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-black/10" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
                <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    {eyebrow}
                </span>
                <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {title}
                </h2>
                <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base lg:text-lg">
                    {description}
                </p>
                <a
                    href="#"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                    {cta}
                </a>
            </div>
        </div>
    )
}

export default HeroMockSlide
