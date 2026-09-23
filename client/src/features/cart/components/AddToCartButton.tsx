import { useToast } from "../../../components/toast/context";
import { useAddItem, useCart } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";
import { QuantityStepper } from "./QuantityStepper";

interface AddToCartButtonProps {
    productId: number;
    className?: string;
}

/**
 * "Add to Cart" button that morphs into an inline quantity stepper once the
 * product is in the cart. Reads quantity straight from the shared cart query.
 */
export const AddToCartButton = ({ productId, className }: AddToCartButtonProps) => {
    const { data: cart } = useCart();
    const addItem = useAddItem();
    const toast = useToast();
    const busy = addItem.isPending;

    const quantity = cart?.items.find((item) => item.product_id === productId)?.quantity ?? 0;

    if (quantity > 0) {
        return (
            <QuantityStepper
                productId={productId}
                quantity={quantity}
                onError={(message) => toast.error(message)}
            />
        );
    }

    return (
        <button
            type="button"
            disabled={busy || addItem.isPending}
            onClick={() =>
                addItem.mutate({ productID: productId, quantity: 1 }, {
                    onError: (err) => toast.error(getCartErrorMessage(err, "Could not add to cart")),
                })
            }
            className={`shrink-0 rounded-full bg-brand px-2.5 py-1.5 text-[10px] font-semibold uppercase text-white transition-all hover:opacity-90 sm:text-xs cursor-pointer hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
        >
            Add to Cart
        </button>
    );
};