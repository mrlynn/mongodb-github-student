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
  if (req.isAuthenticated==false) {
     req.user=null;
  }
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
    "In GET /admin: " + JSON.stringify(req.user)
  );
  res.render("admin", {
    title: "MongoDB Student Pack",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});
router.get("/admin/students", isAdmin(), function(req, res, next) {
  console.log(
    "In GET /students: " + JSON.stringify(req.user)
  );
  res.render("students", {
    title: "MongoDB Student Pack",
    user: req.user,
    client_id: process.env.GITHUB_AUTH_CLIENT_ID
  });
});


function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(
      `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
    );
    if (req.isAuthenticated()) {
      // req.user = req.session.passport;
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
      // req.user = req.session.passport;
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
