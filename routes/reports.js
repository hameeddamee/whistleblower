const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Report = mongoose.model("reports");
// const User = mongoose.model('users');
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// reports Index
router.get("/", (req, res) => {
  Report.find({ status: "public" })
    .populate("user")
    .then(reports => {
      res.render("reports/index", {
        reports: reports
      });
    });
});

// Show Single Report
router.get("/show/:id", (req, res) => {
  Report.findOne({
    _id: req.params.id
  })
    .populate("user")
    .then(report => {
      res.render("reports/show", {
        report: report
      });
    });
});

// Add Report Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("reports/add");
});

// Edit Report Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Report.findOne({
    _id: req.params.id
  }).then(report => {
    res.render("reports/edit", {
      report: report
    });
  });
});

// Process Add Report
router.post("/", (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newReport = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create Report
  new Report(newReport).save().then(report => {
    res.redirect(`/reports/show/${report.id}`);
  });
});

// Edit Form Process
router.put("/:id", (req, res) => {
  Report.findOne({
    _id: req.params.id
  }).then(report => {
    let allowComments;

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    // New values
    report.title = req.body.title;
    report.body = req.body.body;
    report.status = req.body.status;
    report.allowComments = allowComments;

    Report.save().then(report => {
      res.redirect("/dashboard");
    });
  });
});

// Delete Report
router.delete("/:id", (req, res) => {
  Report.remove({ _id: req.params.id }).then(() => {
    res.redirect("/dashboard");
  });
});

module.exports = router;
