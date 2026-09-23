-- 20260923_cart.sql
-- Cart entity + checkout idempotency.
--
-- Identity model: a cart belongs to exactly one identity - either an
-- authenticated user (user_id) or an anonymous guest (guest_token_hash, the
-- SHA-256 of the raw client token). UNIQUE (not partial) on each column works
-- because Postgres treats multiple NULLs as distinct.

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    guest_token_hash CHAR(64) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_carts_guest_token_hash ON carts (guest_token_hash);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts (user_id);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);

-- Idempotent checkout: a client retry with the same key returns the original
-- order. NULLs (legacy/public orders) are exempt from uniqueness.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
    ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;