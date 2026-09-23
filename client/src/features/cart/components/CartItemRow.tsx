import { TrashIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "../../../lib/format";
import { useRemoveItem } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";
import type { CartItem } from "../types";
import { QuantityStepper } from "./QuantityStepper";

interface CartItemRowProps {
    item: CartItem;
    onError: (message: string) => void;
}

export const CartItemRow = ({ item, onError }: CartItemRowProps) => {
    const removeItem = useRemoveItem();

    return (
        <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-secondary">{item.name}</h3>
                    <button
                        type="button"
                        onClick={() =>
                            removeItem.mutate(item.product_id, {
                                onError: (err) => onError(getCartErrorMessage(err, "Could not remove item")),
                            })
                        }
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(item.unit_price)} each</p>
                {!item.is_available && (
                    <span className="mt-1 w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                        Unavailable
                    </span>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper productId={item.product_id} quantity={item.quantity} onError={onError} />
                    <span className="text-sm font-bold text-secondary">{formatPrice(item.subtotal)}</span>
                </div>
            </div>
        </li>
    );
};