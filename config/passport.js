const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");
const configAuth = require("../config/constants").site;
const request = require('superagent');
const CodeUtil = require("./codeUtil");

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
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
        process.nextTick(function() {
          console.log("In passport github strategy in next tick");
          User.findOne({ "github.id": profile.id }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                // update isStudent - checking frequently is okiedokie.
                console.log("Checking if " + user.name + " is a participant / student using token '" + accessToken + "'");
                request
                .get("https://education.github.com/api/user")
                .set("Accept", "application/json")
                .set("Authorization", "token " + accessToken)
                .then(response => {
                    // console.log(
                    //     "Is this person a student?" + JSON.stringify(response.body)
                    // );
                    console.log(user.name + " is a participant / student: " + response.body.student + " " +user.isStudent);
                    if (user.isStudent==true) {
                        if (user.atlas.code) {
                            // do nothing - already has atlas code.

                            if(typeof user.save == 'function') {
                                user.save();
                            };
                            return done(null,user);
                        } else {
                            console.log("calling codeutil");

                            CodeUtil.fetchCodeForUser(user,function(err,code) {
                                if (err) {
                                    console.log("Error: " + err.message);
                                    if (err) throw err;
                                } else {
                                    console.log("success: " + code);
                                    user.atlas.code=code
                                    user.save();
                                    return done(null,user);
                                }
                            });
                        }
                    }
                })
                .catch(err=>{
                    console.log("Error: " + err.message);
                    return done(err);
                })
                return done(null, user);
            } else {
              var isStudent = false;
              request
                .get("https://education.github.com/api/user")
                .set("Accept", "application/json")
                .set("Authorization", "token " + accessToken)
                .then(response => {
                    console.log(
                        "Is this person a student?" + JSON.stringify(response.body)
                    );
                    isStudent=response.body.student;
                })
                .catch(err=>{
                    console.log("Error: " + err.message);
                    return done(err);
                })
              const newUser = new User();
              newUser.isStudent=isStudent;
              newUser.github.id = profile.id;
              newUser.github.token = accessToken;
              newUser.github.name = profile.displayName;
              if (profile.emails != undefined) {
                newUser.github.email = profile.emails[0].value;
                newUser.email = profile.emails[0].value;
              } else {
                newUser.email = "";
                newUser.github.email = "";
              }
              newUser.name = profile.displayName;
              newUser.imgUrl = profile.photos[0].value || "";
              newUser.github.username = profile.username;
              CodeUtil.fetchCodeForUser(newUser, function(err,code) {
                newUser.atlas.code = code;
                newUser.save(function(err) {
                  if (err) throw err;
                });
              });
              return done(null, newUser);
            }
          });
        });
      }
    )
  );
};
