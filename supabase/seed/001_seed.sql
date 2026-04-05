-- ============================================================
-- PENGUIN MVP — SEED DATA
-- ============================================================
-- Run after schema + functions

-- 1. SHOP
INSERT INTO shops (id, name, legal_name, city, address, country_code, timezone, default_locale, receipt_locale, currency, default_daily_limit_grams, default_monthly_limit_grams)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Penguin Social Club',
    'Penguin Social Club Barcelona S.L.',
    'Barcelona',
    'Carrer Example 42, 08001 Barcelona',
    'ES',
    'Europe/Madrid',
    'es',
    'es',
    'EUR',
    5.00,
    60.00
);


-- 2. STAFF (PINs are bcrypt hashes — these are for development only)
-- PIN: 1234 → hash generated with bcrypt cost 10
-- In production, generate real hashes via the app

-- Admin user (PIN: 1234)
INSERT INTO staff_users (id, shop_id, full_name, email, pin_hash, role)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Admin Penguin',
    'admin@penguinclub.es',
    '$2b$10$eHHCMH8doc.Iw.SLBLmJGegEPu.uUP3XVrhEmkcUYo1abnZ1Vdnv6',
    'admin'
);

-- Attendant 1 (PIN: 5678)
INSERT INTO staff_users (id, shop_id, full_name, pin_hash, role)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'María García',
    '$2b$10$XAWqjoQoUD.X3Tg9rKi3hOMI9a.Yyd.7O7Vw4MiQrRaqiaenJTWpO',
    'attendant'
);

-- Attendant 2 (PIN: 9012)
INSERT INTO staff_users (id, shop_id, full_name, pin_hash, role)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Carlos López',
    '$2b$10$Vy0pzeXdx9H.nChnZY1Ld.rGKtmwjb.Ni.Ug9CAtJUSyPuJkMwm7m',
    'attendant'
);


-- 3. SUBCATEGORIES
INSERT INTO subcategories (shop_id, key, category, sort_order) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'dry_sift',      'hash',       1),
    ('a0000000-0000-0000-0000-000000000001', 'ice_hash',      'hash',       2),
    ('a0000000-0000-0000-0000-000000000001', 'temple_ball',   'hash',       3),
    ('a0000000-0000-0000-0000-000000000001', 'rosin',         'extraction', 1),
    ('a0000000-0000-0000-0000-000000000001', 'live_rosin',    'extraction', 2),
    ('a0000000-0000-0000-0000-000000000001', 'resin',         'extraction', 3),
    ('a0000000-0000-0000-0000-000000000001', 'wax',           'extraction', 4),
    ('a0000000-0000-0000-0000-000000000001', 'crumble',       'extraction', 5),
    ('a0000000-0000-0000-0000-000000000001', 'budder',        'extraction', 6),
    ('a0000000-0000-0000-0000-000000000001', 'shatter',       'extraction', 7),
    ('a0000000-0000-0000-0000-000000000001', 'distillate',    'extraction', 8),
    ('a0000000-0000-0000-0000-000000000001', 'cartridge',     'vape',       1),
    ('a0000000-0000-0000-0000-000000000001', 'disposable',    'vape',       2),
    ('a0000000-0000-0000-0000-000000000001', 'gummy',         'edible',     1),
    ('a0000000-0000-0000-0000-000000000001', 'chocolate',     'edible',     2),
    ('a0000000-0000-0000-0000-000000000001', 'cookie',        'edible',     3),
    ('a0000000-0000-0000-0000-000000000001', 'capsule',       'edible',     4),
    ('a0000000-0000-0000-0000-000000000001', 'other_edible',  'edible',     5),
    ('a0000000-0000-0000-0000-000000000001', 'infused_drink', 'beverage',   1),
    ('a0000000-0000-0000-0000-000000000001', 'other_bev',     'beverage',   2),
    ('a0000000-0000-0000-0000-000000000001', 'paper',         'accessory',  1),
    ('a0000000-0000-0000-0000-000000000001', 'grinder',       'accessory',  2),
    ('a0000000-0000-0000-0000-000000000001', 'filter',        'accessory',  3),
    ('a0000000-0000-0000-0000-000000000001', 'lighter',       'accessory',  4),
    ('a0000000-0000-0000-0000-000000000001', 'tray',          'accessory',  5),
    ('a0000000-0000-0000-0000-000000000001', 'storage',       'accessory',  6),
    ('a0000000-0000-0000-0000-000000000001', 'other_acc',     'accessory',  7);


-- 4. SAMPLE PRODUCTS
INSERT INTO products (shop_id, name, category, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order) VALUES
    -- Flowers
    ('a0000000-0000-0000-0000-000000000001', 'Amnesia Haze',    'flower', 'gram', 8.00,  120.0, 20.0, true, 1),
    ('a0000000-0000-0000-0000-000000000001', 'Critical Kush',   'flower', 'gram', 7.00,  85.5,  20.0, true, 2),
    ('a0000000-0000-0000-0000-000000000001', 'OG Kush',         'flower', 'gram', 9.00,  45.0,  20.0, true, 3),
    ('a0000000-0000-0000-0000-000000000001', 'Gorilla Glue',    'flower', 'gram', 8.50,  67.2,  20.0, true, 4),
    ('a0000000-0000-0000-0000-000000000001', 'Lemon Haze',      'flower', 'gram', 7.50,  92.0,  20.0, true, 5);

-- Hash (need subcategory IDs — use subquery)
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Moroccan Dry Sift', 'hash', id, 'gram', 10.00, 50.0, 10.0, true, 1
FROM subcategories WHERE key = 'dry_sift' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Ice-O-Lator Premium', 'hash', id, 'gram', 15.00, 25.0, 5.0, true, 2
FROM subcategories WHERE key = 'ice_hash' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

-- Extractions
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Rosin Press OG', 'extraction', id, 'gram', 20.00, 15.0, 5.0, true, 1
FROM subcategories WHERE key = 'rosin' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Shatter Gold', 'extraction', id, 'gram', 18.00, 10.0, 3.0, true, 2
FROM subcategories WHERE key = 'shatter' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

-- Vapes (unit-based, with gram_equivalent)
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, gram_equivalent, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Vape Cart — Lemon Haze', 'vape', id, 'unit', 25.00, 30, 5, true, 0.50, 1
FROM subcategories WHERE key = 'cartridge' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, gram_equivalent, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Disposable Vape — Gelato', 'vape', id, 'unit', 15.00, 20, 5, true, 0.30, 2
FROM subcategories WHERE key = 'disposable' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

-- Edibles (unit-based, with gram_equivalent)
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, gram_equivalent, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'CBD Gummies 10mg', 'edible', id, 'unit', 5.00, 50, 10, true, 0.10, 1
FROM subcategories WHERE key = 'gummy' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, gram_equivalent, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Space Cookie', 'edible', id, 'unit', 6.00, 25, 5, true, 0.20, 2
FROM subcategories WHERE key = 'cookie' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

-- Beverages
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, gram_equivalent, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'CBD Infused Tea', 'beverage', id, 'unit', 4.00, 40, 10, true, 0.05, 1
FROM subcategories WHERE key = 'infused_drink' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

-- Accessories (unit-based, no limit)
INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'RAW King Size Papers', 'accessory', id, 'unit', 2.00, 100, 20, false, 1
FROM subcategories WHERE key = 'paper' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Santa Cruz Grinder', 'accessory', id, 'unit', 15.00, 10, 3, false, 2
FROM subcategories WHERE key = 'grinder' AND shop_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO products (shop_id, name, category, subcategory_id, unit_type, price_per_unit, stock_quantity, low_stock_threshold, counts_toward_limit, sort_order)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Clipper Lighter', 'accessory', id, 'unit', 1.50, 50, 10, false, 3
FROM subcategories WHERE key = 'lighter' AND shop_id = 'a0000000-0000-0000-0000-000000000001';


-- 5. SAMPLE MEMBERS
INSERT INTO members (shop_id, full_name, document_type, document_number, date_of_birth, phone, membership_start, membership_end, status, daily_limit_grams, monthly_limit_grams) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Carlos Méndez',     'dni',      '12345678A', '1990-05-15', '+34612345678', '2026-01-01', '2027-01-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Ana Rodríguez',     'dni',      '23456789B', '1988-11-22', '+34623456789', '2026-01-01', '2027-01-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Pedro Fernández',   'nie',      'X1234567L', '1995-03-08', '+34634567890', '2026-01-01', '2027-01-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Laura Martínez',    'passport', 'AB1234567', '1992-07-30', '+34645678901', '2026-01-01', '2027-01-01', 'active',    3.00, 40.00),
    ('a0000000-0000-0000-0000-000000000001', 'Miguel Torres',     'dni',      '34567890C', '1985-01-10', '+34656789012', '2026-01-01', '2027-01-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Sofia García',      'dni',      '45678901D', '1998-09-25', NULL,           '2025-01-01', '2026-01-01', 'expired',   5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'David López',       'nie',      'Y2345678M', '1993-12-03', '+34678901234', '2026-01-01', '2027-01-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Elena Ruiz',        'dni',      '56789012E', '1987-06-18', '+34689012345', '2026-01-01', '2027-01-01', 'suspended', 5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Jorge Navarro',     'passport', 'CD2345678', '1991-04-12', '+34690123456', '2026-02-01', '2027-02-01', 'active',    5.00, 60.00),
    ('a0000000-0000-0000-0000-000000000001', 'Isabel Moreno',     'dni',      '67890123F', '1996-08-07', '+34601234567', '2026-03-01', '2027-03-01', 'active',    5.00, 60.00);
