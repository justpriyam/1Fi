const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "database.sqlite");

if (!fs.existsSync(DB_PATH)) {
  // Auto-seed on first run (e.g. fresh clone / fresh deploy) so the API
  // never serves against a missing database.
  require("./seed");
}

const db = new Database(DB_PATH, { fileMustExist: true });
db.pragma("foreign_keys = ON");

module.exports = db;
