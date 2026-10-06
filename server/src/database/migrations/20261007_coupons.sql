-- Coupons: percent, fixed-amount and free-delivery. One coupon per order,
-- and only the checkout path can apply it because the final total (including
-- delivery) is not known until the serving branch is selected.
--
-- Admin-authored, so the checks are written to guard the invariant, not the
-- user's typing.

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,

    -- Human name for the admin UI; the code is what the customer types.
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,

    -- Type determines which value field matters and what it means.
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('percentage', 'fixed_amount', 'free_delivery')),

    -- Amount in percent (e.g. 15 for 15%) or in the currency's smallest unit
    -- logic-wise: fixed amounts are stored in the same NUMERIC scale as money.
    -- Percentage uses value as 0-100; fixed_amount as a non-negative sum.
    value NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Optional minimum spend to make it apply. Not required for free_delivery.
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),

    -- Single-use or reusable; we track usage by coupon_id + order_id to allow
    -- audits without mutating a usage count on replay. usage_count is derived
    -- in queries if needed, but `max_uses` is the cap.
    max_uses INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Expiry is a window only (no start time specified by the plan). Expired
    -- means not redeemable at the moment of checkout.
    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- A percentage coupon makes sense between 1 and 100 (0 would be a no-op).
    CHECK (
        (type = 'percentage' AND value > 0 AND value <= 100)
        OR (type = 'fixed_amount' AND value > 0)
        OR (type = 'free_delivery' AND value = 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons (expires_at);

-- Link a redeemed coupon to the order that consumed it. At most one coupon
-- per order (enforced by UNIQUE(order_id)) and an order cannot be created
-- twice with different coupons in any case, since the order row is unique.
CREATE TABLE IF NOT EXISTS order_coupons (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,

    -- Snapshot the amount actually taken off (discount_amount on the order),
    -- in case the coupon value changed later or was renamed. The receipt
    -- must show what was actually charged.
    discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0),

    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
