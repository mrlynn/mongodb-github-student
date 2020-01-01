const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.set('useCreateIndex', true);

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
            default: Date.now(),
        },
        remaining_amount_dollars: {
            type: Number
        }
    },
    imgUrl: {
      type: String,
      default: '/images/user.png'
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

UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
      console.log('Doc: ' + JSON.stringify(doc));
    next(new Error('There was a duplicate key error' + JSON.stringify(error)));
  } else {
    next(error);
  }
});

const User = (module.exports = mongoose.model('User', UserSchema));

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
