/**
 * Order money, decided in exactly one place.
 *
 * Both the cart quote and the authoritative checkout write `total`, and the
 * figures have to agree to the piastre or the receipt stops matching the
 * invoice. `computeTotals` is the only function allowed to produce them.
 */

export type OrderType = "Delivery" | "Pickup";

export const ORDER_TYPES: OrderType[] = ["Delivery", "Pickup"];

export interface OrderTotals {
    /** Sum of the priced lines, before any discount. */
    subtotal: number;
    /** Amount taken off by a coupon. Never more than the subtotal. */
    discount: number;
    /** Charged only on delivery, at the serving branch's rate. */
    deliveryFee: number;
    /** What the customer pays: subtotal - discount + deliveryFee. */
    total: number;
}

/** Money is stored NUMERIC(10,2); round here so JS float drift never reaches it. */
export const roundMoney = (value: number): number => Math.round(value * 100) / 100;

/**
 * Applies a discount and delivery fee to a subtotal.
 *
 * The clamps are the point: a discount is whatever a coupon says it is, and a
 * coupon is admin-authored data. A fixed-amount coupon larger than the basket,
 * or a percentage that rounds up past it, must not be able to produce a
 * negative total — the database CHECK would reject it and the customer's order
 * would fail at the last step.
 */
export const computeTotals = (
    subtotal: number,
    discount: number,
    deliveryFee: number
): OrderTotals => {
    const base = roundMoney(Math.max(Number(subtotal) || 0, 0));
    const applied = roundMoney(Math.min(Math.max(Number(discount) || 0, 0), base));
    const fee = roundMoney(Math.max(Number(deliveryFee) || 0, 0));

    return {
        subtotal: base,
        discount: applied,
        deliveryFee: fee,
        total: roundMoney(Math.max(base - applied + fee, 0)),
    };
};

/**
 * Pickup is always free. Delivery is billed at the branch that will actually
 * fulfil it, since a branch's fee reflects its own distance and coverage.
 */
export const resolveDeliveryFee = (orderType: OrderType, branchDeliveryFee: number): number =>
    orderType === "Delivery" ? roundMoney(Math.max(Number(branchDeliveryFee) || 0, 0)) : 0;
