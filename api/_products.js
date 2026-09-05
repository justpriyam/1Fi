const { findProduct, listProducts } = require("./catalog");

module.exports = (req, res) => {
  const identifier = req.query.idOrSlug || req.url.replace(/^\/api\/products\/?/, "");

  if (!identifier) {
    return res.status(200).json(listProducts());
  }

  const product = findProduct(identifier.split("?")[0]);
  if (!product) {
    return res.status(404).json({ error: `No product found with identifier "${identifier}"` });
  }

  return res.status(200).json(product);
};