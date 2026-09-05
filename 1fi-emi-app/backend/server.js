const path = require("path");
const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Static placeholder product images (generic SVGs, not real product photos)
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/products", productsRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`1Fi EMI backend listening on http://localhost:${PORT}`);
});
