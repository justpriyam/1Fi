const http = require("http");
const assert = require("assert");
const express = require("express");
const path = require("path");
const cors = require("cors");
const productsRouter = require("../routes/products");

// Set up a test server instance on a random available port
const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/products", productsRouter);
app.use((req, res) => res.status(404).json({ error: "Not found" }));

function fetchJson(server, path) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    http
      .get(`http://localhost:${port}${path}`, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const body = JSON.parse(raw);
            resolve({ status: res.statusCode, headers: res.headers, body });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw });
          }
        });
      })
      .on("error", reject);
  });
}

async function runTests() {
  console.log("Starting backend API tests...\n");
  const server = app.listen(0);

  try {
    // 1. Health Check
    {
      const res = await fetchJson(server, "/api/health");
      assert.strictEqual(res.status, 200, "Health check should return 200");
      assert.strictEqual(res.body.status, "ok", "Health status should be ok");
      console.log("✓ GET /api/health passed");
    }

    // 2. Products Catalog List
    {
      const res = await fetchJson(server, "/api/products");
      assert.strictEqual(res.status, 200, "Products catalog should return 200");
      assert(Array.isArray(res.body), "Response should be an array");
      assert(res.body.length >= 3, `Expected at least 3 products, got ${res.body.length}`);

      for (const p of res.body) {
        assert(p.id, "Product should have an id");
        assert(p.slug, "Product should have a slug");
        assert(p.name, "Product should have a name");
        assert(p.brand, "Product should have a brand");
        assert(p.startingPrice > 0, "Product should have startingPrice > 0");
        assert(p.mrp >= p.startingPrice, "Product MRP should be >= startingPrice");
        assert(p.imageUrl, "Product should have imageUrl");
      }
      console.log("✓ GET /api/products passed");
    }

    // 3. Lookup Product by Slug
    {
      const res = await fetchJson(server, "/api/products/iphone-17-pro");
      assert.strictEqual(res.status, 200, "Slug lookup should return 200");
      assert.strictEqual(res.body.slug, "iphone-17-pro");
      assert.strictEqual(res.body.name, "iPhone 17 Pro");
      assert.strictEqual(res.body.badge, "NEW", "iPhone 17 Pro should have NEW badge");
      assert(Array.isArray(res.body.variants), "Product should contain variants array");
      assert(res.body.variants.length >= 2, "Product should have 2+ variants");

      const v1 = res.body.variants[0];
      assert(v1.emiPlans.length >= 7, "Variant should have 7 EMI options");
      assert.strictEqual(v1.emiPlans[0].tenureMonths, 3);
      assert.strictEqual(v1.emiPlans[0].interestRate, 0);
      assert.strictEqual(v1.emiPlans[0].monthlyAmount, Math.round(v1.mrp / 3));
      console.log("✓ GET /api/products/iphone-17-pro (slug) passed");
    }

    // 4. Lookup Product by ID
    {
      const res = await fetchJson(server, "/api/products/1");
      assert.strictEqual(res.status, 200, "ID lookup should return 200");
      assert.strictEqual(res.body.id, 1, "Product ID should match");
      assert.strictEqual(res.body.name, "iPhone 17 Pro");
      console.log("✓ GET /api/products/1 (numeric ID) passed");
    }

    // 5. Lookup Samsung by Spec Slug and Alias
    {
      const resSpec = await fetchJson(server, "/api/products/samsung-s24-ultra");
      assert.strictEqual(resSpec.status, 200, "Spec slug /samsung-s24-ultra should return 200");
      assert.strictEqual(resSpec.body.slug, "samsung-s24-ultra");

      const resAlias = await fetchJson(server, "/api/products/samsung-galaxy-s24-ultra");
      assert.strictEqual(resAlias.status, 200, "Alias slug should return 200");
      assert.strictEqual(resAlias.body.name, "Galaxy S24 Ultra");
      console.log("✓ GET /api/products/samsung-s24-ultra (and alias) passed");
    }

    // 6. 404 for Unknown ID and Unknown Slug
    {
      const resId = await fetchJson(server, "/api/products/9999");
      assert.strictEqual(resId.status, 404, "Unknown ID should return 404");
      assert(resId.body.error, "Error message should be returned");

      const resSlug = await fetchJson(server, "/api/products/non-existent-device");
      assert.strictEqual(resSlug.status, 404, "Unknown slug should return 404");
      console.log("✓ GET /api/products/non-existent (404 handling) passed");
    }

    // 7. Static Image Serving
    {
      const res = await fetchJson(server, "/images/iphone-17-pro-orange.svg");
      assert.strictEqual(res.status, 200, "Static SVG image should return 200");
      assert(
        res.headers["content-type"].includes("svg") || res.headers["content-type"].includes("xml"),
        "Image content-type should be SVG"
      );
      console.log("✓ GET /images/iphone-17-pro-orange.svg passed");
    }

    console.log("\nAll backend API test suites PASSED successfully! 🎉");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
