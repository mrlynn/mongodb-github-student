const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const request = require("superagent");
const Code = require("./code");

mongoose.set("useCreateIndex", true);

// User Schema
var UserSchema = mongoose.Schema(
  {
    name: String,
    isStudent: {
      type: Boolean,
      default: false
    },
    email: {
      type: String
    },
    atlas: {
      code: {
        type: String
      },
      created: {
        type: Date,
        default: Date.now()
      },
      remaining_amount_dollars: {
        type: Number
      }
    },
    imgUrl: {
      type: String,
      default: "/images/user.png"
    },
    admin: {
      type: Boolean,
      default: false
    },
    ip: {
      type: String
    },
    local: {
      username: {
        type: String
      },
      password: {
        type: String
      },
      email: {
        type: String
      },
      name: {
        type: String
      }
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    github: {
      id: String,
      token: String,
      email: String,
      name: String,
      username: String
    }
  },
  { timestamps: true }
);

UserSchema.post("save", function(error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    console.log("Doc: " + JSON.stringify(doc));
    next(new Error("There was a duplicate key error" + JSON.stringify(error)));
  } else {
    next(error);
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.local.password, salt, function(err, hash) {
      newUser.local.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  User.findOne(query, callback); // findOne() is a mongoose function that takes query as argument
};

module.exports.getUserById = function(id, callback) {
  User.findOne(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.checkStudent = function(token, profile, callback) {
  request
    .get("https://education.github.com/api/user")
    .set("Accept", "application/json")
    .set("Authorization", "token " + token)
    .then(response => {
      var query = { "github.id": profile.id };
      User.findOne(query, async function(err, user) {
        if (!user) {
          user = new User();
        }
        if (!user.atlas.code) {
          code = await Code.getNextCode(user._id);
        } else {
          code = user.atlas.code;
        }
        user.isStudent = response.text.student;
        var email = "";
        if (profile.emails) {
          var email = profile.emails[0].value;
        }
        var imgUrl = "";
        if (profile.photos) {
          var imgUrl = profile.photos[0].value || "";
        }
        user.github = {
          id: profile.id,
          token: token,
          name: profile.displayName,
          email: email
        };
        user.email = email;
        user.imgUrl = imgUrl;
        user.username = profile.username;
        user.atlas.code = code;
        user.save();
        callback(null, user);

      });
    })
    .catch(err => {
      console.log("Error: " + err.message);
      callback(err);
    });
};
