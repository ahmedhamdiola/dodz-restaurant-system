-- ---------------------------------------------------------------------------
-- Piece-mix option groups (e.g. "12 pieces: 8 original + 4 spicy").
--
-- The existing model cannot express this. A meal is a FIXED number of pieces that
-- the customer divides between two sides, but:
--   * a selection is a SET of value ids, so "six spicy" is unrepresentable, and
--   * every group validates its own min/max in isolation, so nothing can say
--     "these two groups must add up to twelve".
--
-- 'quantity' groups hold a per-value COUNT instead of a pick, and link to one
-- partner group. The pair's counts must total `linked_total`.
-- ---------------------------------------------------------------------------

-- A third group type whose values are counted rather than picked.
ALTER TABLE product_options DROP CONSTRAINT IF EXISTS product_options_type_check;
ALTER TABLE product_options
    ADD CONSTRAINT product_options_type_check
    CHECK (type = ANY (ARRAY['radio', 'checkbox', 'quantity']));

ALTER TABLE product_options
    ADD COLUMN IF NOT EXISTS linked_group_id INTEGER REFERENCES product_options(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS linked_total INTEGER,
    ADD COLUMN IF NOT EXISTS unit_label TEXT;

ALTER TABLE product_options DROP CONSTRAINT IF EXISTS product_options_linked_total_check;
ALTER TABLE product_options
    ADD CONSTRAINT product_options_linked_total_check
    CHECK (linked_total IS NULL OR linked_total >= 0);

-- A group cannot be its own partner.
ALTER TABLE product_options DROP CONSTRAINT IF EXISTS product_options_link_check;
ALTER TABLE product_options
    ADD CONSTRAINT product_options_link_check
    CHECK (linked_group_id IS NULL OR linked_group_id <> id);

-- Counting and linking are two halves of one idea: either a group participates in
-- a fixed-size pair or it is an ordinary independent group. Mixing them (a radio
-- group that must total 12, or a quantity group with no total) is meaningless,
-- so the database refuses it rather than leaving it to application code.
--
-- The remaining invariant -- that linked_group_id points at another COUNTED group
-- on the SAME product, and that the two totals match -- is a cross-row fact that a
-- row-level CHECK cannot see (and PostgreSQL cannot defer a CHECK, only unique/PK/
-- FK/exclude). It is enforced authoritatively in resolveSelection(), which runs on
-- both add-to-cart and checkout against the stored tree.
ALTER TABLE product_options DROP CONSTRAINT IF EXISTS product_options_quantity_link_check;
ALTER TABLE product_options
    ADD CONSTRAINT product_options_quantity_link_check
    CHECK (
        (type = 'quantity' AND linked_total IS NOT NULL)
        OR
        (type <> 'quantity' AND linked_group_id IS NULL AND linked_total IS NULL)
    );

-- min/max_selections describe picks, so they must not be set on a counted group.
ALTER TABLE product_options DROP CONSTRAINT IF EXISTS product_options_quantity_bounds_check;
ALTER TABLE product_options
    ADD CONSTRAINT product_options_quantity_bounds_check
    CHECK (type <> 'quantity' OR (min_selections = 0 AND max_selections IS NULL));
