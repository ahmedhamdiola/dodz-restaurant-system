-- Subject: Branch admins — per-branch stock and branch → main-admin alerts.
--
-- Until now every account was either a customer or a global admin, and stock
-- was the single boolean products.is_available shared by all five branches.
-- This migration introduces the operations layer:
--
--   1. role 'branch_admin' + users.branch_id. A branch admin sees only their
--      branch's dashboard (menu + stock) and can message the main admins; the
--      existing requireRole('admin') gates keep excluding them from user,
--      coupon and branch management. The extra CHECK guarantees a branch admin
--      is never floating without a branch.
--   2. branch_stock — quantity + low-stock threshold per (branch, product).
--      Products stay global; each branch counts its own inventory. Rows are
--      upserted from the branch dashboard, so the unique key is the contract.
--   3. branch_alerts — the "we need X" / "we're busy" notes a branch sends to
--      the main admins, with a pending → acknowledged → resolved workflow.
--
-- Idempotent (the runner re-applies every file each run): all statements use
-- IF NOT EXISTS / drop-and-re-add constraints / ON CONFLICT DO NOTHING.
-- Mirrored into schema.sql for fresh installs.

-- ---------------------------------------------------------------- 1. users

ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);

-- Original check (auto-named by Postgres when declared inline in schema.sql).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('customer', 'staff', 'admin', 'branch_admin'));

-- A branch admin without a branch is a routing dead end: their dashboard has
-- nothing to scope to. Re-checked on every write by the users controller.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_branch_admin_requires_branch_check;
ALTER TABLE users ADD CONSTRAINT users_branch_admin_requires_branch_check
    CHECK (role <> 'branch_admin' OR branch_id IS NOT NULL);

-- ----------------------------------------------------------- 2. branch_stock

CREATE TABLE IF NOT EXISTS branch_stock (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    product_id INTEGER NOT NULL REFERENCES products(id),

    -- Units left at this branch. 0 = out; the row stays so history and the
    -- editor keep working, it is not a delete.
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    -- Dashboard marks anything at or below this as "low stock" so the branch
    -- can reorder before hitting zero.
    low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (branch_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_branch_stock_branch_id ON branch_stock (branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_stock_product_id ON branch_stock (product_id);

-- Existing products get a neutral starting count so the dashboard opens with
-- plausible numbers instead of a wall of "out of stock"; branches overwrite
-- these with real counts. ON CONFLICT keeps re-runs silent.
INSERT INTO branch_stock (branch_id, product_id, quantity, low_stock_threshold)
SELECT b.id, p.id, 50, 10
FROM branches b
CROSS JOIN products p
WHERE b.is_deleted = false
  AND p.is_deleted = false
  AND p.is_modifier = false
ON CONFLICT (branch_id, product_id) DO NOTHING;

-- ---------------------------------------------------------- 3. branch_alerts

CREATE TABLE IF NOT EXISTS branch_alerts (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id),

    -- The branch account that sent it. SET NULL rather than CASCADE: an alert
    -- is an ops record — losing the sender must not erase the message, and the
    -- branch is already identified by branch_id.
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    type VARCHAR(20) NOT NULL CHECK (type IN ('needs_stock', 'busy', 'other')),
    message TEXT NOT NULL CHECK (length(btrim(message)) > 0),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'acknowledged', 'resolved')),

    -- Who on the main-admin side picked it up, and when. Stamped on
    -- acknowledge; backfilled when an alert jumps straight to resolved.
    acknowledged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Main-admin inbox: newest first, usually filtered to pending.
CREATE INDEX IF NOT EXISTS idx_branch_alerts_status_created
    ON branch_alerts (status, created_at DESC);
-- A branch reading back its own sent history.
CREATE INDEX IF NOT EXISTS idx_branch_alerts_branch_id ON branch_alerts (branch_id);
