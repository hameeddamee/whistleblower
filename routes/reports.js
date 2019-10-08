const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// reports Index
router.get("/", (req, res) => {
  res.render("reports/index");
});

// Add Story Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("reports/add");
});

module.exports = router;
