const TENURES = [
  { months: 3, rate: 0 },
  { months: 6, rate: 0 },
  { months: 12, rate: 0 },
  { months: 24, rate: 0 },
  { months: 36, rate: 10.5 },
  { months: 48, rate: 10.5 },
  { months: 60, rate: 10.5 },
];

const PRODUCTS = [
  {
    id: 1,
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "Apple",
    category: "smartphone",
    badge: "NEW",
    description: "Apple's flagship Pro phone with the A19 Pro chip and a titanium frame.",
    cashback: 7500,
    variants: [
      { id: 1, storage: "256GB", colorName: "Cosmic Orange", colorHex: "#C96A34", mrp: 134900, price: 127400, imageUrl: "/images/iphone-17-pro-orange.svg", isDefault: true, fee: 4800 },
      { id: 2, storage: "256GB", colorName: "Silver", colorHex: "#E4E4E2", mrp: 134900, price: 129900, imageUrl: "/images/iphone-17-pro-silver.svg", isDefault: false, fee: 2300 },
      { id: 3, storage: "512GB", colorName: "Deep Blue", colorHex: "#1F3A5F", mrp: 154900, price: 147400, imageUrl: "/images/iphone-17-pro-blue.svg", isDefault: false, fee: 4800 },
    ],
  },
  {
    id: 2,
    slug: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphone",
    badge: null,
    description: "Samsung's top-tier Galaxy with a built-in S Pen and a 200MP camera.",
    cashback: 6000,
    variants: [
      { id: 4, storage: "256GB", colorName: "Titanium Black", colorHex: "#2B2B2B", mrp: 129999, price: 119999, imageUrl: "/images/samsung-s24-ultra-black.svg", isDefault: true, fee: 4000 },
      { id: 5, storage: "512GB", colorName: "Titanium Gray", colorHex: "#8A8A8A", mrp: 144999, price: 134999, imageUrl: "/images/samsung-s24-ultra-gray.svg", isDefault: false, fee: 4000 },
    ],
  },
  {
    id: 3,
    slug: "google-pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    category: "smartphone",
    badge: null,
    description: "Google's Pixel flagship with the Tensor G4 chip and Gemini built in.",
    cashback: 5000,
    variants: [
      { id: 6, storage: "128GB", colorName: "Obsidian", colorHex: "#1A1A1A", mrp: 99999, price: 92999, imageUrl: "/images/google-pixel-9-pro-obsidian.svg", isDefault: true, fee: 3000 },
      { id: 7, storage: "256GB", colorName: "Porcelain", colorHex: "#EDE7DD", mrp: 109999, price: 102999, imageUrl: "/images/google-pixel-9-pro-porcelain.svg", isDefault: false, fee: 3000 },
    ],
  },
];

function monthlyAmount(principal, months, rate) {
  if (rate === 0) return Math.round(principal / months);
  const monthlyRate = rate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

function withPlans(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    badge: product.badge,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      storage: variant.storage,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      mrp: variant.mrp,
      price: variant.price,
      imageUrl: variant.imageUrl,
      isDefault: variant.isDefault,
      emiPlans: TENURES.map(({ months, rate }, index) => ({
        id: variant.id * 10 + index + 1,
        tenureMonths: months,
        monthlyAmount: monthlyAmount(rate === 0 ? variant.mrp : variant.price + variant.fee, months, rate),
        interestRate: rate,
        cashbackAmount: product.cashback,
      })),
    })),
  };
}

const PRODUCTS_WITH_PLANS = PRODUCTS.map(withPlans);
const SLUG_ALIASES = { "samsung-galaxy-s24-ultra": "samsung-s24-ultra" };

function listProducts() {
  return PRODUCTS_WITH_PLANS.map((product) => {
    const variant = product.variants.find((item) => item.isDefault) || product.variants[0];
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      badge: product.badge,
      imageUrl: variant.imageUrl,
      startingPrice: variant.price,
      mrp: variant.mrp,
    };
  });
}

function findProduct(identifier) {
  const resolved = SLUG_ALIASES[identifier] || identifier;
  return PRODUCTS_WITH_PLANS.find((product) => product.slug === resolved || String(product.id) === resolved) || null;
}

module.exports = { findProduct, listProducts };
