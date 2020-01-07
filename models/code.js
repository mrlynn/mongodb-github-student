const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.set('useCreateIndex', true);

// User Schema
var CodeSchema = mongoose.Schema(
  {
    code: String,
    assigned: {
        type: Boolean,
        default: false
    },
    student: {
      type: String
    },
    org: {
      type: String
    },
},
    { timestamps: true }
);

CodeSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
      console.log('Doc: ' + JSON.stringify(doc));
    next(new Error('There was a duplicate key error'));
  } else {
    next(error);
  }
});

const Code = (module.exports = mongoose.model('Code', CodeSchema));

module.exports.getNextCode = function(id) {
  var query = { assigned: false}
  var update = { student: id, assigned: true }
  var code = Code.findOneAndUpdate(query,update);
  return code.code;
}
