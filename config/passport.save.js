const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");
const configAuth = require("../config/constants").site;
const request = require("superagent");
const CodeUtil = require("./codeUtil");
var ctr=0;
module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    console.log("Serialize");

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
        process.nextTick( async function() {
          console.log("Profile: " + JSON.stringify(profile));
          console.log("In passport github strategy in next tick");
          
          await User.findOne({ "github.id": profile.id }, async function(err, user) {
            if (err) {
              return done(err);
            }
            if (user) {
              // update isStudent - checking frequently is okiedokie.
              await request
                .get("https://education.github.com/api/user")
                .set("Accept", "application/json")
                .set("Authorization", "token " + accessToken)
                .then(async response => {
                  if (user.isStudent == true) {
                    if (user.atlas.code) {
                      //
                      // do nothing - already has atlas code.
                      //
                      // if (typeof user.save == "function") {
                      //   user.save();
                      // }
                      return done(null, user);
                    } else {
                      console.log("calling codeutil");

                      CodeUtil.fetchCodeForUser(user, function(err, code) {
                        if (err) {
                          console.log("Error: " + err.message);
                          if (err) throw err;
                        } else {
                          console.log("success: " + code);
                          user.atlas.code = code;
                          user.save();
                          ctr++;
                          console.log("CounteR: " + ctr);
                          return done(null, user);
                        }
                      });
                    }
                  }
                })
                .catch(err => {
                  console.log("Error: " + err.message);
                  return done(err);
                });
              return done(null, user);
            } else {
              //
              // User with github.id not found. Need to add a document for this user.
              //
              console.log("Profile: " + JSON.stringify(profile));

              var isStudent = false; // assume that they're not a student.
              request
                .get("https://education.github.com/api/user")
                .set("Accept", "application/json")
                .set("Authorization", "token " + accessToken)
                .then(async response => {
                  console.log("got response: " + JSON.stringify(response));
                  isStudent = response.text.student;
                  var email='';
                  if(profile.emails) {
                    var email = profile.emails[0].value;
                  }
                  var imgUrl = profile.photos[0].value || "";
                  const newUser = new User({
                    isStudent: isStudent,
                    github: {
                      id: profile.id,
                      token: accessToken,
                      name: profile.displayName,
                      email: email
                    },
                    email: email,
                    imgUrl: imgUrl,
                    username: profile.username
                  });
                  CodeUtil.fetchCodeForUser(newUser, async function(err, code) {
                    if (err) {
                      throw err;
                    }
                    newUser.atlas.code = code;
                    await newUser.save(function(err) {
                      console.log("Saved");
              
                      if (err) throw err;
                    });
                  });
                  return done(null, newUser);
                })
                .catch(err => {
                  console.log("Error: " + err.message);
                  return done(err);
                });

              
            }
          });
        });
      }
    )
  );
};
