import { PencilIcon } from "@heroicons/react/24/outline";
import type { MenuProduct } from "../../../menu/types";

interface StudioProductCardProps {
    product: MenuProduct;
    onEdit: (product: MenuProduct) => void;
}

const formatPrice = (value: number) =>
    value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const StudioProductCard = ({ product, onEdit }: StudioProductCardProps) => {
    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold uppercase text-muted-foreground/30">
                        {product.name.charAt(0)}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                    className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-secondary shadow-md transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white"
                >
                    <PencilIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-secondary">{product.name}</h3>
                    <span className="shrink-0 text-sm font-bold tracking-tight text-secondary">
                        EGP {formatPrice(product.price)}
                    </span>
                </div>
                {product.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {product.description}
                    </p>
                )}
                <span className="mt-auto flex w-fit flex-wrap gap-1.5 pt-1">
                    {product.isCustomizable ? (
                        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                            Customizable
                        </span>
                    ) : (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Fixed
                        </span>
                    )}
                </span>
            </div>
        </article>
    );
};

export default StudioProductCard;