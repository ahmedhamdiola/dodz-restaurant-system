import { useMemo } from "react";
import { useToast } from "../../../components/toast/context";
import { useCustomizeUI } from "../../products/customize/customizeContext";
import { useAddItem, useCart } from "../hooks/useCart";
import { getCartErrorMessage } from "../services/cartApi";
import { QuantityStepper } from "./QuantityStepper";

interface AddToCartButtonProps {
    product: {
        id: number;
        name: string;
        description: string;
        image: string;
        price: number;
        isCustomizable?: boolean;
    };
    className?: string;
}

/**
 * Storefront "add" control, one affordance for every product. Customizable
 * products open the shared "Customize Your Meal" modal and only add once the
 * customer confirms; everything else adds directly. Non-customizable products
 * morph into an inline stepper once a *plain* line (no option selections) for
 * that product exists, so a customised line is never edited by accident.
 */
export const AddToCartButton = ({ product, className }: AddToCartButtonProps) => {
    const { data: cart } = useCart();
    const addItem = useAddItem();
    const customize = useCustomizeUI();
    const toast = useToast();
    const busy = addItem.isPending;

    const plainLine = useMemo(
        () => cart?.items.find((item) => item.product_id === product.id && item.options.length === 0),
        [cart?.items, product.id]
    );
    const quantity = plainLine?.quantity ?? 0;

    const stepper =
        quantity > 0 && plainLine ? (
            <QuantityStepper
                cartItemId={plainLine.id}
                quantity={quantity}
                compact
                onError={(message) => toast.error(message)}
            />
        ) : null;

    // Both variants share one class string so a customizable product's button is
    // laid out identically to a plain one (sized to its label, never stretched),
    // which is what lets them sit on the same line as the price.
    const addClass = `shrink-0 rounded-full bg-brand px-2.5 py-1.5 text-[10px] font-semibold uppercase text-white transition-all hover:opacity-90 sm:text-xs cursor-pointer hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`;

    const openCustomizer = () =>
        customize.open({
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            price: product.price,
        });

    const addDirectly = () =>
        addItem.mutate(
            { productID: product.id, quantity: 1 },
            {
                onError: (err) =>
                    toast.error(getCartErrorMessage(err, "Could not add to cart")),
            }
        );

    if (product.isCustomizable === true) {
        // Same button as every other product, on the same line as the price — it
        // just opens the customizer first and adds on confirm. A customizable
        // product can never have a plain line (its required groups always
        // contribute selections), so there is no stepper to show here.
        return (
            <button type="button" onClick={openCustomizer} className={addClass}>
                Add to Cart
            </button>
        );
    }

    if (stepper) {
        return stepper;
    }

    return (
        <button
            type="button"
            disabled={busy}
            onClick={addDirectly}
            className={addClass}
        >
            Add to Cart
        </button>
    );
};
