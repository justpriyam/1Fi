const express = require("express");
const db = require("../db");

const router = express.Router();

// Shape a flat SQL row-set of (product + variant + emi_plan) joins into
// the nested JSON shape the frontend consumes.
function assembleProduct(rows) {
  if (rows.length === 0) return null;

  const first = rows[0];
  const variantsById = new Map();

  for (const row of rows) {
    if (!variantsById.has(row.variant_id)) {
      variantsById.set(row.variant_id, {
        id: row.variant_id,
        storage: row.storage,
        colorName: row.color_name,
        colorHex: row.color_hex,
        mrp: row.mrp,
        price: row.price,
        imageUrl: row.image_url,
        isDefault: !!row.is_default,
        emiPlans: [],
      });
    }
    if (row.plan_id != null) {
      variantsById.get(row.variant_id).emiPlans.push({
        id: row.plan_id,
        tenureMonths: row.tenure_months,
        monthlyAmount: row.monthly_amount,
        interestRate: row.interest_rate,
        cashbackAmount: row.cashback_amount,
      });
    }
  }

  const variants = [...variantsById.values()].map((v) => ({
    ...v,
    emiPlans: v.emiPlans.sort((a, b) => a.tenureMonths - b.tenureMonths),
  }));

  return {
    id: first.product_id,
    slug: first.slug,
    name: first.name,
    brand: first.brand,
    category: first.category,
    description: first.description,
    badge: first.badge || null,
    variants,
  };
}

const PRODUCT_JOIN = `
  SELECT
    p.id AS product_id, p.slug, p.name, p.brand, p.category, p.description, p.badge,
    v.id AS variant_id, v.storage, v.color_name, v.color_hex, v.mrp, v.price,
    v.image_url, v.is_default,
    e.id AS plan_id, e.tenure_months, e.monthly_amount, e.interest_rate, e.cashback_amount
  FROM products p
  JOIN variants v ON v.product_id = p.id
  LEFT JOIN emi_plans e ON e.variant_id = v.id
`;

const SLUG_ALIASES = {
  "samsung-galaxy-s24-ultra": "samsung-s24-ultra",
};

// GET /api/products - lightweight list for a catalog / homepage view
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.id, p.slug, p.name, p.brand, p.category, p.badge,
              v.image_url, v.price, v.mrp
       FROM products p
       JOIN variants v ON v.product_id = p.id
       WHERE v.is_default = 1 OR v.id = (SELECT MIN(id) FROM variants WHERE product_id = p.id)
       GROUP BY p.id
       ORDER BY p.id`
    )
    .all();

  res.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      category: r.category,
      badge: r.badge || null,
      imageUrl: r.image_url,
      startingPrice: r.price,
      mrp: r.mrp,
    }))
  );
});

// GET /api/products/:idOrSlug - lookup by ID (e.g. /api/products/1) or slug (e.g. /api/products/iphone-17-pro)
router.get("/:idOrSlug", (req, res) => {
  const param = req.params.idOrSlug;
  const isNumeric = /^\d+$/.test(param);
  const resolvedSlug = SLUG_ALIASES[param] || param;

  const rows = db
    .prepare(
      `${PRODUCT_JOIN} WHERE ${isNumeric ? "p.id = ?" : "p.slug = ?"} ORDER BY v.id, e.tenure_months`
    )
    .all(isNumeric ? Number(param) : resolvedSlug);

  const product = assembleProduct(rows);

  if (!product) {
    return res.status(404).json({ error: `No product found with identifier "${param}"` });
  }
  res.json(product);
});

module.exports = router;
