const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");
const configAuth = require("../config/constants").site;
const request = require("superagent");
const CodeUtil = require("./codeUtil");
var ctr=0;
module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    console.log("Serialize");
    console.log("User: " + JSON.stringify(user));
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      console.log("Deserialize");
      done(err, user);
    });
  });

  passport.use(
    new GithubStrategy(
      {
        clientID: configAuth.oAuth.githubAuth.clientID,
        clientSecret: configAuth.oAuth.githubAuth.clientSecret,
        callbackURL: configAuth.oAuth.githubAuth.callbackURL
      },
      function(accessToken, refreshToken, profile, done) {
        console.log("In passport github strategy");
        // process.nextTick( function() {
          User.checkStudent(accessToken,profile.id,function(err,user) {
          // User.findOne({ "github.id": profile.id }, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              //
              // User with github.id not found. Need to add a document for this user.
              //
              console.log("Not User");
              
            } else {
              return done(err,user);
            }
          });
        // });
      }
    )
  );
};
