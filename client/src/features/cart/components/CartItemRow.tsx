import { TrashIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "../../../lib/format";
import { useRemoveItem } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";
import type { CartLine } from "../types";
import { QuantityStepper } from "./QuantityStepper";

interface CartItemRowProps {
    item: CartLine;
    /** The selected branch cannot fill this product right now. */
    isOutOfStock?: boolean;
    onError: (message: string) => void;
}

export const CartItemRow = ({ item, isOutOfStock = false, onError }: CartItemRowProps) => {
    const removeItem = useRemoveItem();
    const hasSelections = item.options.length > 0;

    return (
        <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className={`h-full w-full object-cover ${isOutOfStock ? "opacity-40" : ""}`}
                />
                {isOutOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 px-1 text-center text-[9px] font-bold uppercase leading-tight tracking-widest text-white">
                        Not found
                    </span>
                )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-secondary">{item.name}</h3>
                    <button
                        type="button"
                        onClick={() =>
                            removeItem.mutate(item.id, {
                                onError: (err) => onError(getCartErrorMessage(err, "Could not remove item")),
                            })
                        }
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
                {hasSelections ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                        {item.selection_summary || item.options.map((option) => option.value_name).join(", ")}
                    </p>
                ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(item.unit_price)} each</p>
                )}
                {isOutOfStock ? (
                    <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                        Out of stock at this branch
                    </span>
                ) : !item.is_available ? (
                    <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                        Unavailable
                    </span>
                ) : null}
                <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                        cartItemId={item.id}
                        quantity={item.quantity}
                        disabled={isOutOfStock}
                        onError={onError}
                    />
                    <span className="text-sm font-bold text-secondary">{formatPrice(item.subtotal)}</span>
                </div>
            </div>
        </li>
    );
};
