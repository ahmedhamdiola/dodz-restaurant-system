/** Shimmering stand-in shown while the option tree is in flight. */
const CustomizeSkeleton = () => (
    <div className="flex flex-col gap-5" aria-hidden="true">
        {[0, 1, 2].map((section) => (
            <div key={section} className="flex flex-col gap-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((card) => (
                        <div
                            key={card}
                            className="h-[58px] animate-pulse rounded-xl border border-border bg-muted/60"
                        />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default CustomizeSkeleton;
