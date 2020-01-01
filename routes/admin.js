var express = require('express');
var router = express.Router();

/* GET /admin */
router.get('/', isAdmin(), function(req, res, next) {
    res.render("admin", { title: "Administration"})
});


function isAdmin () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) {
        req.user = req.session.passport;
        if (req.user.isAdmin == true) {
          return next();
        } else {
          res.redirect('/')
        }
      }
	    res.redirect('/')
	}
}
module.exports = router;
