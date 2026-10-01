CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    cover_image TEXT NOT NULL,
    icon_image TEXT NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),

    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
    sold_amount INTEGER NOT NULL DEFAULT 0 CHECK (sold_amount >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE, -- in stock at the branch
    is_modifier BOOLEAN NOT NULL DEFAULT FALSE  -- an ingredient (cheese, sauce): never listed, never bought alone
);

-- One selectable group of a customizable product ("Bun", "Sauce", "Extras").
-- type = 'radio' means "pick exactly one" and is pinned to max_selections = 1.
-- type = 'quantity' is a counted split (Original/Spicy piece mix): the group is not
-- bounded by max_selections, and it is linked to its partner group through
-- linked_group_id. The two counts must add up to linked_total, which the service
-- layer enforces across rows (Postgres cannot defer a CHECK constraint).
CREATE TABLE IF NOT EXISTS product_options (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('radio', 'checkbox', 'quantity')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    min_selections INTEGER NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
    max_selections INTEGER CHECK (max_selections IS NULL OR max_selections >= min_selections),
    CHECK (type <> 'radio' OR max_selections = 1),

    linked_group_id INTEGER REFERENCES product_options(id) ON DELETE CASCADE,
    linked_total INTEGER CHECK (linked_total IS NULL OR linked_total >= 0),
    unit_label TEXT,
    CHECK (linked_group_id IS NULL OR linked_group_id <> id),

    -- A counted group must declare its total, and a pickable group must not carry
    -- split metadata. linked_group_id is allowed to be NULL on a counted group so
    -- both halves of a new pair can be inserted before they are linked up.
    CHECK (
        (type = 'quantity' AND linked_total IS NOT NULL)
        OR (type <> 'quantity' AND linked_group_id IS NULL AND linked_total IS NULL)
    ),
    -- A counted group is driven by linked_total, never by min/max selections.
    CHECK (type <> 'quantity' OR (min_selections = 0 AND max_selections IS NULL)),

    sort_order INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One choice inside a group. price_delta is the only price authority;
-- modifier_product_id is informational (what the kitchen physically adds).
CREATE TABLE IF NOT EXISTS option_values (
    id SERIAL PRIMARY KEY,
    option_id INTEGER NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    description TEXT,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_delta >= 0),

    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    modifier_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options (product_id);
CREATE INDEX IF NOT EXISTS idx_option_values_option_id ON option_values (option_id);
CREATE INDEX IF NOT EXISTS idx_option_values_modifier_product_id ON option_values (modifier_product_id);


CREATE TABLE IF NOT EXISTS branches(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address VARCHAR(150) NOT NULL,
    phone VARCHAR(11) NOT NULL,
    
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,

    lat NUMERIC(10, 6) NOT NULL,
    lng NUMERIC(10, 6) NOT NULL,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(11) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE, -- soft-deleted emails stay reserved to avoid account confusion
    phone VARCHAR(11) UNIQUE, -- NULL for social-only accounts; UNIQUE allows multiple NULLs

    -- auth: password_hash is nullable so social-login accounts (provider != 'email') can exist without a password
    password_hash TEXT, -- set for password / social logins without password
    provider VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (provider IN ('email', 'google', 'facebook', 'apple')),
    provider_id VARCHAR(150), -- id returned by the social provider; combined with provider to link the account

    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),

    avatar TEXT, -- profile image url
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birthdate DATE,

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMP, -- updated on successful login once auth is implemented

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id),

    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(11),

    status VARCHAR(20) NOT NULL DEFAULT 'Preparing'
        CHECK (status IN ('Completed', 'Preparing', 'On the way', 'Cancelled')),

    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),

    product_name VARCHAR(150) NOT NULL, -- snapshot so renames don't rewrite history
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    options_summary TEXT NOT NULL DEFAULT '',      -- "Large bun · Extra Cheddar, Comeback Sauce"
    options_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb -- exact value ids, so history survives renames
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- TODO(future migration): users_favorites table (user_id, product_id) for customer favorite products
-- TODO(future migration): users_addresses table (user_id, address, lat, lng, ...) for delivery addresses