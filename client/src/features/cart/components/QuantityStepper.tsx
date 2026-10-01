import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { MAX_QUANTITY } from "../types";
import { useRemoveItem, useUpdateQuantity } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";

interface QuantityStepperProps {
    /** The cart LINE id (not the product id) — a product can have several lines. */
    cartItemId: number;
    quantity: number;
    compact?: boolean;
    onError?: (message: string) => void;
}

/**
 * +/- stepper used both in the cart row and inline on product cards. Buttons are
 * disabled while a cart mutation is in flight so rapid clicks can't race the
 * server (each op is exact-set, so overlapping requests would drop increments).
 */
export const QuantityStepper = ({ cartItemId, quantity, compact = false, onError }: QuantityStepperProps) => {
    const updateQuantity = useUpdateQuantity();
    const removeItem = useRemoveItem();
    const busy = updateQuantity.isPending || removeItem.isPending;

    const fail = (err: unknown, fallback: string) => onError?.(getCartErrorMessage(err, fallback));

    const decrement = () => {
        if (quantity <= 1) {
            removeItem.mutate(cartItemId, {
                onError: (err) => fail(err, "Could not remove item"),
            });
        } else {
            updateQuantity.mutate({ cartItemID: cartItemId, quantity: quantity - 1 }, {
                onError: (err) => fail(err, "Could not update quantity"),
            });
        }
    };

    const increment = () => {
        if (quantity >= MAX_QUANTITY) return;
        updateQuantity.mutate({ cartItemID: cartItemId, quantity: quantity + 1 }, {
            onError: (err) => fail(err, "Could not update quantity"),
        });
    };

    const size = compact ? "h-6 w-6" : "h-8 w-8";
    const icon = compact ? "h-3 w-3" : "h-3.5 w-3.5";

    return (
        <div className="flex items-center rounded-full border border-border bg-muted/60" role="group" aria-label="Quantity">
            <button
                type="button"
                onClick={decrement}
                disabled={busy}
                aria-label="Decrease quantity"
                className={`${size} flex cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50`}
            >
                <MinusIcon className={icon} />
            </button>
            <span className={`min-w-6 text-center font-semibold ${compact ? "text-xs" : "text-sm"}`}>{quantity}</span>
            <button
                type="button"
                onClick={increment}
                disabled={busy || quantity >= MAX_QUANTITY}
                aria-label="Increase quantity"
                className={`${size} flex cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50`}
            >
                <PlusIcon className={icon} />
            </button>
        </div>
    );
};
