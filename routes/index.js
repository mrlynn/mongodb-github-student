var express = require("express");
var router = express.Router();
const axios = require("axios");
const request = require("superagent");
require("dotenv").config();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const passport = require("passport");
const config = require("../config/constants");
var template = require("./template.js");
var upload = require("./upload.js");
var studentRouter = require('./students');

/* GET home page. */
router.get("/", function(req, res, next) {
  console.log("User: " + req.user);
  console.log("Authenticated: " + req.isAuthenticated());
  res.render("index", {
    title: "MongoDB Student Pack",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});

router.get("/profile", authenticationMiddleware(), function(req, res) {
  res.render("profile", {
    title: "MongoDB Student Pack",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});

/**
 * Admin functions
 */
router.post("/upload", debug(), upload.post);

router.get("/upload", isAdmin(), function(req, res) {
  console.log("Upload GET");
  console.log("User: " + JSON.stringify(req.user));
  res.render("upload", {
    title: "Upload Codes",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });});

router.get("/template", template.get);

router.get("/logout", function(req, res) {
  req.session.destroy(function(err) {
    res.redirect("/"); 
  });
});

/**
 * Administrative
 */

router.get("/admin", isAdmin(), function(req, res, next) {
  console.log(
    "In GET /admin"
  );
  res.render("admin", {
    title: "MongoDB Student Pack",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});

// router.get("/auth/github/callback", (req, res, next) => {
//   const { query } = req;
//   const { code } = query;
//   console.log("Got here");
//   if (!code) {
//     res.send({
//       success: false,
//       message: "Error: code not received"
//     });
//   }
//   const data = {
//     client_id: process.env.GITHUB_CLIENT_ID,
//     client_secret: process.env.GITHUB_CLIENT_SECRET,
//     code: code,
//     scope: "read:user"
//   };
//   console.log("STEP 4 Continued - send data " + JSON.stringify(data));
//   request
//     .post("https://github.com/login/oauth/access_token")
//     .send({
//       client_id: process.env.GITHUB_CLIENT_ID,
//       client_secret: process.env.GITHUB_CLIENT_SECRET,
//       code: code,
//       scope: "read:user"
//     })
//     .set("Accept", "application/json")
//     .set("Authorization", "token " + code)
//     .then(response => {
//       console.log(
//         "Complete Response from Step 5 = " + JSON.stringify(response.body)
//       );
//       const token = response.body.access_token;
//       console.log(
//         "STEP 5 - Receive Token -  Got a response from step 2 including a bearer token: " +
//           token +
//           " - done"
//       );
//       if (token.length <= 10) {
//         res.send({
//           success: false,
//           message: "Invalid token received"
//         });
//       }
//       request
//         .get("https://education.github.com/api/user")
//         .set("Accept", "application/json")
//         .set("Authorization", "token " + token)
//         .then(response => {
//           console.log(
//             "STEP 6 success - Send token back to api (https://education.github.com/api/user) to get user details -  Next, sent token back to github to get user data and got this response: " +
//               JSON.stringify(response.body)
//           );
//           console.log(
//             "Is this person a student?" + JSON.stringify(response.body)
//           );
//           if (response.body.student == false) {
//             // res.redirect("http://localhost:3000/notstudent"); // redirect to a page letting the student know about signing up for the student pack
//             // following is just for testing because we don't have an actual student approved to test with yet.
//             // Let's try to get user details so we can record for fulfillment.
//             console.log("Step 7 - send a request to get user profile data.");
//             console.log("GET https://api.github.com/user with token " + token);

//             const AuthStr = "Bearer ".concat(token);
//             axios
//               .get("https://api.github.com/user", {
//                 headers: { Authorization: AuthStr }
//               })
//               .then(response => {
//                 // If request is good...
//                 console.log(response.data);
//                 var rtn = addUser(response.data, token);
//               })
//               .catch(error => {
//                 console.log("error " + error);
//               });
//           } else {
//             // student: true
//             // Let's get and then record the student profile details
//             const AuthStr = "Bearer ".concat(token);
//             axios
//               .get("https://api.github.com/user", {
//                 headers: { Authorization: AuthStr }
//               })
//               .then(response => {
//                 // If request is good...
//                 console.log(response.data);
//               })
//               .catch(error => {
//                 console.log("error " + error);
//               });
//           }
//         })
//         .catch(err => {
//           console.log(
//             "STEP 6 fail - Send token back to api (https://education.github.com/api/user) to get user details - Got error trying to get user data: " +
//               JSON.stringify(err.message)
//           );
//         });
//     })
//     .catch(err => {
//       console.log(
//         "STEP 4 Send code back to get a bearer token - Got error trying to get token: " +
//           JSON.stringify(err.message)
//       );
//     });
// });
function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(
      `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
    );
    if (req.isAuthenticated()) {
      req.user = req.session.passport;
      return next();
    }
    res.redirect("/");
  };
}
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
function debug() {
  return (req, res, next) => {
    console.log("In test");
    return next();
  };
}
module.exports.close = async function close() {
  if (client) client.close();
  client = undefined;
};
module.exports = router;
