const { findProduct, listProducts } = require("./catalog");

module.exports = (req, res) => {
  const requestPath = String(req.url || "").split("?", 1)[0];
  const identifier = req.query?.idOrSlug || requestPath.replace(/^\/api\/products\/?/, "");

  if (!identifier) {
    return res.status(200).json(listProducts());
  }

  const product = findProduct(identifier);
  if (!product) {
    return res.status(404).json({ error: `No product found with identifier "${identifier}"` });
  }

  return res.status(200).json(product);
};