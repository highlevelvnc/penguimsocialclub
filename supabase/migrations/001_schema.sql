-- ============================================================
-- PENGUIN MVP SCHEMA v1
-- PostgreSQL / Supabase
-- ============================================================

-- Enums
CREATE TYPE staff_role       AS ENUM ('admin', 'attendant');
CREATE TYPE member_status    AS ENUM ('active', 'expired', 'suspended');
CREATE TYPE document_type    AS ENUM ('dni', 'nie', 'passport');
CREATE TYPE product_category AS ENUM ('flower','hash','extraction','vape','edible','beverage','accessory');
CREATE TYPE unit_type        AS ENUM ('gram', 'unit');
CREATE TYPE payment_method   AS ENUM ('cash', 'card');
CREATE TYPE adjustment_type  AS ENUM ('restock', 'correction', 'loss', 'return');


-- 1. SHOPS
CREATE TABLE shops (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(150)  NOT NULL,
    legal_name                  VARCHAR(250),
    tax_id                      VARCHAR(50),
    address                     TEXT,
    city                        VARCHAR(100),
    country_code                CHAR(2)       NOT NULL DEFAULT 'ES',
    timezone                    VARCHAR(50)   NOT NULL DEFAULT 'Europe/Madrid',
    default_locale              VARCHAR(5)    NOT NULL DEFAULT 'es',
    receipt_locale              VARCHAR(5)    NOT NULL DEFAULT 'es',
    currency                    VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    default_daily_limit_grams   DECIMAL(6,2)  NOT NULL DEFAULT 5.00,
    default_monthly_limit_grams DECIMAL(8,2)  NOT NULL DEFAULT 60.00,
    created_at                  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- 2. STAFF USERS
CREATE TABLE staff_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID         NOT NULL REFERENCES shops(id),
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(254) UNIQUE,
    pin_hash    VARCHAR(100) NOT NULL,
    role        staff_role   NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_shop_active
    ON staff_users(shop_id) WHERE active = true;


-- 3. MEMBERS
CREATE TABLE members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id             UUID          NOT NULL REFERENCES shops(id),
    full_name           VARCHAR(200)  NOT NULL,
    document_type       document_type NOT NULL,
    document_number     VARCHAR(50)   NOT NULL,
    date_of_birth       DATE          NOT NULL,
    phone               VARCHAR(30),
    email               VARCHAR(254),
    photo_url           TEXT,
    membership_start    DATE          NOT NULL DEFAULT CURRENT_DATE,
    membership_end      DATE          NOT NULL,
    status              member_status NOT NULL DEFAULT 'active',
    daily_limit_grams   DECIMAL(6,2)  NOT NULL,
    monthly_limit_grams DECIMAL(8,2)  NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    UNIQUE(shop_id, document_number),
    CONSTRAINT chk_member_age
        CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

CREATE INDEX idx_members_shop_status
    ON members(shop_id, status);
CREATE INDEX idx_members_name_search
    ON members(shop_id, full_name varchar_pattern_ops);
CREATE INDEX idx_members_document
    ON members(shop_id, document_number);


-- 4. SUBCATEGORIES
CREATE TABLE subcategories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID             NOT NULL REFERENCES shops(id),
    key         VARCHAR(50)      NOT NULL,
    category    product_category NOT NULL,
    sort_order  INTEGER          NOT NULL DEFAULT 0,
    active      BOOLEAN          NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),

    UNIQUE(shop_id, key)
);


-- 5. PRODUCTS
CREATE TABLE products (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id              UUID             NOT NULL REFERENCES shops(id),
    name                 VARCHAR(150)     NOT NULL,
    category             product_category NOT NULL,
    subcategory_id       UUID             REFERENCES subcategories(id),
    unit_type            unit_type        NOT NULL,
    price_per_unit       DECIMAL(10,2)    NOT NULL,
    stock_quantity       DECIMAL(10,2)    NOT NULL DEFAULT 0,
    low_stock_threshold  DECIMAL(10,2)    NOT NULL DEFAULT 0,
    counts_toward_limit  BOOLEAN          NOT NULL DEFAULT true,
    gram_equivalent      DECIMAL(6,2),
    description          VARCHAR(500),
    sort_order           INTEGER          NOT NULL DEFAULT 0,
    active               BOOLEAN          NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),

    CONSTRAINT chk_gram_no_equivalent
        CHECK (unit_type = 'unit' OR gram_equivalent IS NULL),
    CONSTRAINT chk_unit_cannabis_equivalent
        CHECK (
            unit_type = 'gram'
            OR counts_toward_limit = false
            OR gram_equivalent IS NOT NULL
        ),
    CONSTRAINT chk_stock_non_negative
        CHECK (stock_quantity >= 0),
    CONSTRAINT chk_price_positive
        CHECK (price_per_unit > 0)
);

CREATE INDEX idx_products_shop_category
    ON products(shop_id, category) WHERE active = true;


-- 6. TRANSLATIONS
CREATE TABLE translations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID         NOT NULL REFERENCES shops(id),
    entity_type VARCHAR(30)  NOT NULL,
    entity_key  VARCHAR(50)  NOT NULL,
    locale      VARCHAR(5)   NOT NULL,
    label       VARCHAR(200) NOT NULL,

    UNIQUE(shop_id, entity_type, entity_key, locale)
);

CREATE INDEX idx_translations_lookup
    ON translations(shop_id, entity_type, locale);


-- 7. TRANSACTIONS
CREATE TABLE transactions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id              UUID           NOT NULL REFERENCES shops(id),
    member_id            UUID           NOT NULL REFERENCES members(id),
    staff_user_id        UUID           NOT NULL REFERENCES staff_users(id),
    payment_method       payment_method NOT NULL,
    total_amount         DECIMAL(10,2)  NOT NULL,
    cannabis_grams_total DECIMAL(8,2)   NOT NULL DEFAULT 0,
    item_count           INTEGER        NOT NULL,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT chk_total_non_negative
        CHECK (total_amount >= 0),
    CONSTRAINT chk_cannabis_grams_non_negative
        CHECK (cannabis_grams_total >= 0)
);

CREATE INDEX idx_transactions_shop_date
    ON transactions(shop_id, created_at);
CREATE INDEX idx_transactions_member
    ON transactions(member_id, created_at);


-- 8. TRANSACTION ITEMS
CREATE TABLE transaction_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id   UUID             NOT NULL REFERENCES transactions(id),
    product_id       UUID             NOT NULL REFERENCES products(id),
    product_name     VARCHAR(150)     NOT NULL,
    product_category product_category NOT NULL,
    unit_type        unit_type        NOT NULL,
    quantity         DECIMAL(8,2)     NOT NULL,
    unit_price       DECIMAL(10,2)    NOT NULL,
    line_total       DECIMAL(10,2)    NOT NULL,
    cannabis_grams   DECIMAL(8,2)     NOT NULL DEFAULT 0,

    CONSTRAINT chk_quantity_positive
        CHECK (quantity > 0),
    CONSTRAINT chk_line_total_non_negative
        CHECK (line_total >= 0)
);

CREATE INDEX idx_transaction_items_txn
    ON transaction_items(transaction_id);


-- 9. STOCK ADJUSTMENTS
CREATE TABLE stock_adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID            NOT NULL REFERENCES shops(id),
    product_id      UUID            NOT NULL REFERENCES products(id),
    adjustment_type adjustment_type NOT NULL,
    quantity        DECIMAL(10,2)   NOT NULL,
    reason          TEXT,
    performed_by    UUID            NOT NULL REFERENCES staff_users(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_adj_product
    ON stock_adjustments(product_id, created_at);


-- 10. DAILY CLOSES
CREATE TABLE daily_closes (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id                  UUID          NOT NULL REFERENCES shops(id),
    close_date               DATE          NOT NULL,
    total_transactions       INTEGER       NOT NULL,
    total_revenue            DECIMAL(12,2) NOT NULL,
    cash_total               DECIMAL(12,2) NOT NULL,
    card_total               DECIMAL(12,2) NOT NULL,
    cannabis_grams_dispensed DECIMAL(10,2) NOT NULL,
    unique_members_served    INTEGER       NOT NULL,
    expected_cash            DECIMAL(12,2) NOT NULL,
    actual_cash              DECIMAL(12,2),
    cash_difference          DECIMAL(12,2),
    notes                    TEXT,
    closed_by                UUID          NOT NULL REFERENCES staff_users(id),
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),

    UNIQUE(shop_id, close_date)
);
