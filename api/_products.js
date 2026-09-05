const productsRouter = require("../1fi-emi-app/backend/routes/products");

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api\/products/, "") || "/";
  return productsRouter(req, res, (error) => {
    if (error) res.status(500).json({ error: error.message });
  });
};