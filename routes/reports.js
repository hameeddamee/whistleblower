const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Report = mongoose.model("reports");
const { ensureAuthenticated } = require("../helpers/auth");

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
    .populate("comments.commentUser")
    .then(report => {
      if (report.status == "public") {
        res.render("reports/show", {
          report: report
        });
      } else {
        if (req.user) {
          if (req.user.id == report.user._id) {
            res.render("reports/show", {
              report: report
            });
          } else {
            res.redirect("/reports");
          }
        } else {
          res.redirect("/reports");
        }
      }
    });
});

// List reports from a user
router.get("/user/:userId", (req, res) => {
  Report.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(reports => {
      res.render("reports/index", {
        reports: reports
      });
    });
});

// Logged in users reports
router.get("/my", ensureAuthenticated, (req, res) => {
  Report.find({ user: req.user.id })
    .populate("user")
    .then(reports => {
      res.render("reports/index", {
        reports: reports
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
    if (report.user != req.user.id) {
      res.redirect("/reports");
    } else {
      res.render("reports/edit", {
        report: report
      });
    }
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

    report.save().then(report => {
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

// Add Comment
router.post("/comment/:id", (req, res) => {
  Report.findOne({
    _id: req.params.id
  }).then(report => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    // Add to comments array
    report.comments.unshift(newComment);

    report.save().then(report => {
      res.redirect(`/reports/show/${report.id}`);
    });
  });
});

module.exports = router;
