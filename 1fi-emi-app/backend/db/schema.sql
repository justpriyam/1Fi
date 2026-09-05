-- 1Fi SDE1 Assignment: Database schema
-- SQLite (portable to PostgreSQL with minor type changes: SERIAL / TIMESTAMP etc.)

DROP TABLE IF EXISTS emi_plans;
DROP TABLE IF EXISTS variants;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,     -- used for the unique product URL, e.g. /products/iphone-17-pro
  name        TEXT NOT NULL,            -- e.g. "iPhone 17 Pro"
  brand       TEXT NOT NULL,            -- e.g. "Apple"
  category    TEXT NOT NULL DEFAULT 'smartphone',
  description TEXT,
  badge       TEXT                      -- e.g. "NEW"
);

CREATE TABLE variants (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage     TEXT,                     -- e.g. "256GB"
  color_name  TEXT,                     -- e.g. "Cosmic Orange"
  color_hex   TEXT,                     -- swatch color, e.g. "#C96A34"
  mrp         INTEGER NOT NULL,         -- in INR (paise-free, whole rupees)
  price       INTEGER NOT NULL,         -- discounted / selling price in INR
  image_url   TEXT,                     -- product image for this variant
  is_default  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE emi_plans (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id     INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  tenure_months  INTEGER NOT NULL,      -- e.g. 3, 6, 12, 24, 36, 48, 60
  monthly_amount INTEGER NOT NULL,      -- INR per month
  interest_rate  REAL NOT NULL DEFAULT 0, -- e.g. 0, 10.5
  cashback_amount INTEGER NOT NULL DEFAULT 0 -- 0 = no cashback
);

CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_emi_plans_variant_id ON emi_plans(variant_id);
