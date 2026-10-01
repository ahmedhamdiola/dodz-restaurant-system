import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightIcon, ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "../../../components/navbar/hooks/useScrollLock";
import { useEscapeKey } from "../../../components/sidebar/hooks/useEscapeKey";
import { formatPrice } from "../../../lib/format";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../../../components/toast/context";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useCart } from "../hooks/useCart";
import type { OrderView } from "../types";
import { CartItemRow } from "./CartItemRow";
import { CheckoutForm } from "./CheckoutForm";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

type Phase = "cart" | "checkout" | "success";

const SkeletonRow = () => (
    <div className="flex animate-pulse gap-3 border-b border-border py-3">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-muted" />
        <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
    </div>
);

/**
 * Slide-in cart panel. The server cart is the single source of truth, read via
 * the shared Redux Toolkit cart query. Open/close transitions and the
 * cart/checkout/success phases (plus any last-placed order) are reset to the
 * plain cart state each time the drawer reopens.
 */
export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isError, refetch } = useCart();
    const [phase, setPhase] = useState<Phase>("cart");
    const [lastOrder, setLastOrder] = useState<OrderView | null>(null);

    useScrollLock(isOpen);
    useEscapeKey(isOpen, onClose);
    useFocusTrap(panelRef, isOpen);

    // Reset to the plain cart state whenever the drawer reopens, using React's
    // recommended "adjust state during a render" pattern: keep a state copy of
    // the previous `isOpen` and transition during render if it changed. This
    // avoids both effects-driven setState and ref access during render.
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setPhase("cart");
            setLastOrder(null);
        }
    }

    const browseMenu = () => {
        onClose();
        navigate("/menu");
    };

    return (
        <div className={`fixed inset-0 z-[55] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
            {/* Backdrop */}
            <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                onClick={onClose}
                aria-label="Close cart"
                className={`absolute inset-0 h-full w-full cursor-default bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
            />

            {/* Panel */}
            <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                inert={!isOpen}
                tabIndex={-1}
                style={{ translate: isOpen ? "0" : "100%" }}
                className={`
                    absolute right-0 top-0 flex h-dvh w-full flex-col border-l border-border bg-card text-secondary shadow-2xl shadow-black/40
                    transition-transform duration-300 ease-in-out
                    sm:w-[420px]
                    ${isOpen ? "" : "pointer-events-none"}
                `}
            >
                {/* Header */}
                <header className="flex items-center justify-between border-b border-border px-4 py-4">
                    <h2 className="text-lg font-bold tracking-tight">
                        Your Cart
                        {!isLoading && data && data.item_count > 0 && (
                            <span className="ml-1 text-sm font-medium text-muted-foreground">
                                ({data.item_count} item{data.item_count === 1 ? "" : "s"})
                            </span>
                        )}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close cart"
                        className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4">
                    {isError ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <p className="max-w-[220px] text-sm text-muted-foreground">
                                We couldn't load your cart.
                            </p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase text-secondary transition-colors hover:bg-muted"
                            >
                                Try again
                            </button>
                        </div>
                    ) : isLoading || !data ? (
                        <div className="py-2">
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </div>
                    ) : data.items.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <ShoppingCartIcon className="h-12 w-12 text-muted-foreground/60" />
                            <h3 className="text-base font-semibold">Your cart is empty</h3>
                            <p className="max-w-[240px] text-sm text-muted-foreground">
                                Add some crispy favorites before you checkout.
                            </p>
                            <button
                                type="button"
                                onClick={browseMenu}
                                className="mt-1 cursor-pointer rounded-full bg-brand px-5 py-2.5 text-xs font-semibold uppercase text-white transition-opacity hover:opacity-90"
                            >
                                Browse the menu
                            </button>
                        </div>
                    ) : phase === "success" && lastOrder ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <ShoppingCartIcon className="h-10 w-10 text-brand" />
                            <h3 className="text-lg font-bold">Order placed!</h3>
                            <p className="text-sm text-muted-foreground">
                                Order #{lastOrder.id} · EGP {formatPrice(lastOrder.total)}
                            </p>
                            <button
                                type="button"
                                onClick={browseMenu}
                                className="mt-1 cursor-pointer rounded-full bg-brand px-5 py-2.5 text-xs font-semibold uppercase text-white transition-opacity hover:opacity-90"
                            >
                                Keep browsing
                            </button>
                        </div>
                    ) : (
                        <>
                            <ul className="py-1">
                                {data.items.map((item) => (
                                    <CartItemRow
                                        key={item.id}
                                        item={item}
                                        onError={(message) => toast.error(message)}
                                    />
                                ))}
                            </ul>
                            {phase === "cart" ? (
                                <button
                                    type="button"
                                    onClick={() => setPhase("checkout")}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:opacity-90"
                                >
                                    Checkout <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            ) : (
                                <CheckoutForm
                                    onSuccess={() => setPhase("success")}
                                    onCancel={() => setPhase("cart")}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {phase !== "success" && data && data.items.length > 0 && (
                    <footer className="border-t border-border px-4 py-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="text-base font-bold text-secondary">
                                {formatPrice(data.subtotal)}
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Prices are set by the kitchen and confirmed at checkout.
                        </p>
                        {!user && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Log in to keep your cart across devices.{" "}
                                <Link to="/login" onClick={onClose} className="font-semibold text-brand hover:underline">
                                    Log in or sign up
                                </Link>
                            </p>
                        )}
                    </footer>
                )}
            </aside>
        </div>
    );
};
