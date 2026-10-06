-- Delivery fees and order-type awareness.
--
-- schema.sql carries the same columns for fresh installs; this migration brings
-- an existing database to the same shape. Every statement is idempotent.
--
-- WHY THIS EXISTS: until now the server had no idea whether an order was
-- delivered or collected — `orderType` and the delivery address lived only in the
-- browser. An order's total was simply the sum of its lines. That makes it
-- impossible to charge for delivery, and impossible to waive that charge with a
-- free-delivery coupon. The browser also cannot be trusted for either: it is the
-- customer's own machine, so the fee has to be resolved server-side from the
-- branch row.

-- Per-branch delivery rate. Flat, because the branch is the unit that actually
-- decides how far it has to travel; a branch with a fee of 0 is simply free.
ALTER TABLE branches ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_delivery_fee_check;
ALTER TABLE branches ADD CONSTRAINT branches_delivery_fee_check CHECK (delivery_fee >= 0);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(10) NOT NULL DEFAULT 'Pickup';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('Delivery', 'Pickup'));

-- The full breakdown, so a receipt can be reconciled line by line instead of
-- showing one opaque total. `subtotal` is the pre-discount line sum and `total`
-- remains authoritative for reporting and the admin dashboard.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(32);

-- Where the rider goes. Nullable because pickup orders have no destination, and
-- snapshot coordinates because the customer's map pin is a one-time choice that
-- the branch cannot re-derive from an address string.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC(10, 6);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC(10, 6);

-- A delivery order must actually say where it is going; a pickup order must not
-- carry a bogus address.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_destination_check;
ALTER TABLE orders
    ADD CONSTRAINT orders_delivery_destination_check
    CHECK (
        (order_type = 'Pickup' AND delivery_address IS NULL AND delivery_lat IS NULL AND delivery_lng IS NULL)
        OR (order_type = 'Delivery' AND delivery_address IS NOT NULL AND delivery_lat IS NOT NULL AND delivery_lng IS NOT NULL)
    );

-- Historical orders predate the breakdown: their total WAS the line sum, and
-- they were all effectively pickup-at-no-charge. Backfill before the invariant
-- below is enforced, or every existing row fails it.
UPDATE orders SET subtotal = total WHERE subtotal = 0 AND discount_amount = 0 AND delivery_fee = 0;

-- The money invariant, asserted by the database rather than trusted to every
-- caller that inserts an order.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_invariant_check;
ALTER TABLE orders
    ADD CONSTRAINT orders_total_invariant_check
    CHECK (total = subtotal - discount_amount + delivery_fee);
