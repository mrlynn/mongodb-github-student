var express = require('express');
var router = express.Router();

/* GET /admin */
router.get('/', isAdmin(), function(req, res, next) {
    res.render("admin", { title: "Administration"})
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
