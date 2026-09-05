const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "database.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

// Standard reducing-balance EMI formula.
// 0%-interest plans are split evenly across the MRP (rounded), matching
// how 0% EMI is marketed (no interest = principal / tenure).
// Interest-bearing plans use the classic amortization formula on the
// sale price: EMI = P * r * (1+r)^n / ((1+r)^n - 1), r = monthly rate.
function computeMonthlyAmount({ principal, tenureMonths, annualRatePct }) {
  if (annualRatePct === 0) {
    return Math.round(principal / tenureMonths);
  }
  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * factor) / (factor - 1);
  return Math.round(emi);
}

const TENURE_PLANS = [
  { tenure_months: 3, annualRatePct: 0 },
  { tenure_months: 6, annualRatePct: 0 },
  { tenure_months: 12, annualRatePct: 0 },
  { tenure_months: 24, annualRatePct: 0 },
  { tenure_months: 36, annualRatePct: 10.5 },
  { tenure_months: 48, annualRatePct: 10.5 },
  { tenure_months: 60, annualRatePct: 10.5 },
];

const PRODUCTS = [
  {
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "Apple",
    category: "smartphone",
    badge: "NEW",
    description: "Apple's flagship Pro phone with the A19 Pro chip and a titanium frame.",
    cashback: 7500,
    variants: [
      {
        storage: "256GB",
        color_name: "Cosmic Orange",
        color_hex: "#C96A34",
        mrp: 134900,
        price: 127400,
        processing_fee: 4800,
        image_url: "/images/iphone-17-pro-orange.svg",
        is_default: 1,
      },
      {
        storage: "256GB",
        color_name: "Silver",
        color_hex: "#E4E4E2",
        mrp: 134900,
        price: 129900,
        processing_fee: 2300,
        image_url: "/images/iphone-17-pro-silver.svg",
        is_default: 0,
      },
      {
        storage: "512GB",
        color_name: "Deep Blue",
        color_hex: "#1F3A5F",
        mrp: 154900,
        price: 147400,
        processing_fee: 4800,
        image_url: "/images/iphone-17-pro-blue.svg",
        is_default: 0,
      },
    ],
  },
  {
    slug: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphone",
    badge: null,
    description: "Samsung's top-tier Galaxy with a built-in S Pen and a 200MP camera.",
    cashback: 6000,
    variants: [
      {
        storage: "256GB",
        color_name: "Titanium Black",
        color_hex: "#2B2B2B",
        mrp: 129999,
        price: 119999,
        processing_fee: 4000,
        image_url: "/images/samsung-s24-ultra-black.svg",
        is_default: 1,
      },
      {
        storage: "512GB",
        color_name: "Titanium Gray",
        color_hex: "#8A8A8A",
        mrp: 144999,
        price: 134999,
        processing_fee: 4000,
        image_url: "/images/samsung-s24-ultra-gray.svg",
        is_default: 0,
      },
    ],
  },
  {
    slug: "google-pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    category: "smartphone",
    badge: null,
    description: "Google's Pixel flagship with the Tensor G4 chip and Gemini built in.",
    cashback: 5000,
    variants: [
      {
        storage: "128GB",
        color_name: "Obsidian",
        color_hex: "#1A1A1A",
        mrp: 99999,
        price: 92999,
        processing_fee: 3000,
        image_url: "/images/google-pixel-9-pro-obsidian.svg",
        is_default: 1,
      },
      {
        storage: "256GB",
        color_name: "Porcelain",
        color_hex: "#EDE7DD",
        mrp: 109999,
        price: 102999,
        processing_fee: 3000,
        image_url: "/images/google-pixel-9-pro-porcelain.svg",
        is_default: 0,
      },
    ],
  },
];

function seed() {
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");
  // Execute schema.sql to drop & recreate tables cleanly without unlinking (avoids EBUSY locks on Windows)
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  const insertProduct = db.prepare(
    `INSERT INTO products (slug, name, brand, category, description, badge)
     VALUES (@slug, @name, @brand, @category, @description, @badge)`
  );
  const insertVariant = db.prepare(
    `INSERT INTO variants (product_id, storage, color_name, color_hex, mrp, price, image_url, is_default)
     VALUES (@product_id, @storage, @color_name, @color_hex, @mrp, @price, @image_url, @is_default)`
  );
  const insertPlan = db.prepare(
    `INSERT INTO emi_plans (variant_id, tenure_months, monthly_amount, interest_rate, cashback_amount)
     VALUES (@variant_id, @tenure_months, @monthly_amount, @interest_rate, @cashback_amount)`
  );

  const insertAll = db.transaction(() => {
    for (const product of PRODUCTS) {
      const productInfo = insertProduct.run({
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        badge: product.badge || null,
      });
      const productId = productInfo.lastInsertRowid;

      for (const variant of product.variants) {
        const variantInfo = insertVariant.run({
          product_id: productId,
          storage: variant.storage,
          color_name: variant.color_name,
          color_hex: variant.color_hex,
          mrp: variant.mrp,
          price: variant.price,
          image_url: variant.image_url,
          is_default: variant.is_default,
        });
        const variantId = variantInfo.lastInsertRowid;

        for (const plan of TENURE_PLANS) {
          const principal =
            plan.annualRatePct === 0
              ? variant.mrp
              : variant.price + (variant.processing_fee || 0);

          const monthly = computeMonthlyAmount({
            principal,
            tenureMonths: plan.tenure_months,
            annualRatePct: plan.annualRatePct,
          });

          insertPlan.run({
            variant_id: variantId,
            tenure_months: plan.tenure_months,
            monthly_amount: monthly,
            interest_rate: plan.annualRatePct,
            cashback_amount: product.cashback,
          });
        }
      }
    }
  });

  insertAll();
  db.close();
  console.log(`Seeded database at ${DB_PATH}`);
}

seed();

module.exports = { seed, PRODUCTS, TENURE_PLANS, computeMonthlyAmount };
