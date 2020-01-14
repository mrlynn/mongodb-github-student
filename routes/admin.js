var express = require('express');
var router = express.Router();

/* GET /admin */
/**
 * Administrative
 */

router.get("/", isAdmin(), function(req, res, next) {
  console.log(
    "In GET /admin: " + JSON.stringify(req.user)
  );
  res.render("admin", {
    title: "MongoDB Student Pack",
    layout: 'admin',
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});
router.get("/students", isAdmin(), function(req, res, next) {
  console.log(
    "In GET /students: " + JSON.stringify(req.user)
  );
  res.render("students", {
    title: "MongoDB Student Pack",
    layout: 'admin',
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});


function isAdmin() {
  return (req, res, next) => {
    console.log(
      `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
    );
    if (req.isAuthenticated()) {
      console.log("req.user: " + JSON.stringify(req.user));
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
