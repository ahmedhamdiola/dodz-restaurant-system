-- Customer favourites, replacing the placeholder that used to live in schema.sql.
--
-- schema.sql already carries this table for fresh installs; this migration is what
-- brings an existing database up to the same shape. Statements are idempotent, so
-- re-running `npm run migrate` is safe.
--
-- Guests keep their favourites in localStorage and hand them over on login
-- (POST /favorites/merge), so the table only ever holds committed accounts.
--
-- Both keys cascade: deleting a user or a product clears the row. The composite
-- primary key is what makes favouriting idempotent — re-adding is an
-- ON CONFLICT DO NOTHING rather than a duplicate row.
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, product_id)
);

-- Reads are always "this user's favourites, in the order they favourited them",
-- and the leading user_id already serves them through the primary key.
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created ON user_favorites (user_id, created_at);
