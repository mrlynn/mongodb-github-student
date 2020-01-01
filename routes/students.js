var express = require("express");
var router = express.Router();
const Users = require("../models/user");

/* GET /students */
router.get("/", isAdmin(), function(req, res, next) {
  console.log("In students");
  Users.find({}, (err, students) => {
    if (err) {
      req.flash("error","problem finding students");
      res.redirect("/");
    }
    res.render("students", {
      title: "Student Administration",
      students: students
    });
  });
});

function isAdmin() {
  return (req, res, next) => {
    console.log(
      `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
    );
    if (req.isAuthenticated()) {
      req.user = req.session.passport;
      if (req.user.admin == true) {
        return next();
      } else {
        req.flash('error','You must have administrative privileges to access that page.');
        res.redirect("/");
      }
    }
  };
}
module.exports = router;
