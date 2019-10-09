const express = require("express");
const mongoose = require("mongoose");
const Report = mongoose.model("reports");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

router.get("/", ensureGuest, (req, res) => {
  res.render("index/welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Report.find({ user: req.user.id }).then(reports => {
    res.render("index/dashboard", {
      reports: reports
    });
  });
});
router.get("/about", (req, res) => {
  res.render("index/about");
});

module.exports = router;
