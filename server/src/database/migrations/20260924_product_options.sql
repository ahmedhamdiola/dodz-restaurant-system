-- 20260924_product_options.sql
-- "Customize Your Meal" vertical slice. Finishes the half-built
-- product_options / option_values tables that shipped in schema.sql with no
-- code behind them.
--
--   1. option groups get availability + timestamps + integrity constraints
--   2. option values get description, timestamps and a link to a hidden
--      "modifier" product (the physical ingredient the kitchen adds)
--   3. products get is_modifier (an ingredient: never a storefront item,
--      never directly purchasable)
--   4. cart_items get a per-line option identity + server-computed price so
--      "same burger, different toppings" can coexist in one cart
--   5. order_items snapshot the customization so history survives renames
--
-- Every statement is idempotent, so this file can be re-applied freely.
-- NOTE: ALTER TABLE ... ADD CONSTRAINT has no IF NOT EXISTS in Postgres, so the
-- named constraints are guarded by a pg_constraint lookup instead.

-- ---------------------------------------------------------------- 1. groups
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------- 2. values
ALTER TABLE option_values ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE option_values ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE option_values ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE option_values
    ADD COLUMN IF NOT EXISTS modifier_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------- 3. modifier products
-- is_modifier is deliberately distinct from is_available:
--   is_available  = "in stock at the branch"   (applies to every product)
--   is_modifier   = "an ingredient, not a dish" (never listed, never bought alone)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_modifier BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------- 4. cart line identity
-- options_signature: SHA-256 hex of the sorted, de-duplicated, comma-joined
-- option_value ids ('' = no selections). Deterministic, so two identical
-- configurations always collapse onto the same cart line.
-- VARCHAR rather than CHAR(64): bpchar is blank-padded, which would read back
-- as 64 spaces instead of '' and break the "empty means un-customized" contract.
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS options_signature VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS options_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selection_summary TEXT NOT NULL DEFAULT '';

-- Backfill lines created before this migration: they have no options, so the
-- server-computed unit price is the plain product price (idempotent, and only
-- touches lines that still carry the 0 placeholder).
UPDATE cart_items ci
SET unit_price = p.price, updated_at = CURRENT_TIMESTAMP
FROM products p
WHERE p.id = ci.product_id AND ci.unit_price = 0;

-- ---------------------------------------------------------------- 5. order snapshots
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------- indexes
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options (product_id);
CREATE INDEX IF NOT EXISTS idx_option_values_option_id ON option_values (option_id);
CREATE INDEX IF NOT EXISTS idx_option_values_modifier_product_id ON option_values (modifier_product_id);
-- Serves the cart view and the guest-cart merge (both read a cart by identity).
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_signature ON cart_items (cart_id, options_signature);

-- ---------------------------------------------------------------- constraints
DO $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- selections can never be negative
    SELECT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'product_options_min_selections_check'
                     AND conrelid = 'product_options'::regclass) INTO v_exists;
    IF NOT v_exists THEN
        ALTER TABLE product_options
            ADD CONSTRAINT product_options_min_selections_check CHECK (min_selections >= 0);
    END IF;

    -- an upper bound below the lower bound is unsatisfiable
    SELECT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'product_options_max_selections_check'
                     AND conrelid = 'product_options'::regclass) INTO v_exists;
    IF NOT v_exists THEN
        ALTER TABLE product_options
            ADD CONSTRAINT product_options_max_selections_check
            CHECK (max_selections IS NULL OR max_selections >= min_selections);
    END IF;

    -- a radio group picks exactly one thing, so max_selections is pinned to 1
    SELECT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'product_options_radio_max_check'
                     AND conrelid = 'product_options'::regclass) INTO v_exists;
    IF NOT v_exists THEN
        ALTER TABLE product_options
            ADD CONSTRAINT product_options_radio_max_check
            CHECK (type <> 'radio' OR max_selections = 1);
    END IF;

    -- cart prices are computed server-side and are never negative
    SELECT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'cart_items_unit_price_check'
                     AND conrelid = 'cart_items'::regclass) INTO v_exists;
    IF NOT v_exists THEN
        ALTER TABLE cart_items
            ADD CONSTRAINT cart_items_unit_price_check CHECK (unit_price >= 0);
    END IF;
END $$;

-- ---------------------------------------------------------------- line identity swap
-- UNIQUE (cart_id, product_id) cannot express "same product, different
-- toppings"; swap it for the selection-aware key.
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;

DO $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'cart_items_cart_id_product_id_signature_key'
                     AND conrelid = 'cart_items'::regclass) INTO v_exists;
    IF NOT v_exists THEN
        ALTER TABLE cart_items
            ADD CONSTRAINT cart_items_cart_id_product_id_signature_key
            UNIQUE (cart_id, product_id, options_signature);
    END IF;
END $$;
