const router = require('express').Router();
const passport = require('passport');
const config = require('../config/constants');

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('code: ' + JSON.stringify(req.query));
    console.log("req.user: " + req.user);
    res.render("profile", {
      title: "MongoDB Student Pack",
      user: req.user,
      client_id: process.env.GITHUB_AUTH_CLIENT_ID
    });  
  });

module.exports = router;