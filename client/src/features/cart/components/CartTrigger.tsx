import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../hooks/useCart";
import { useCartUI } from "../cartUIContext";

/** Navbar cart button with a live item-count badge (capped at "99+"). */
export const CartTrigger = () => {
    const { data: cart } = useCart();
    const { open } = useCartUI();
    const count = cart?.item_count ?? 0;

    return (
        <button
            type="button"
            onClick={open}
            aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
            className="relative cursor-pointer transition-transform active:scale-95"
        >
            <ShoppingCartIcon className="w-7 sm:w-8 text-secondary" />
            {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    );
};