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
/**
 * function: getNextCode  This function queries the MongoDB DB of Atlas Promo Codes and selects
 * one that has not been previously assigned. It records the student id once if finds an available code.
 * @param   id  String  student id that will receive the next available Atlas Promo Code
 */
module.exports.getNextCode = async function(id) {
  var query = { assigned: false}
  var update = { student: id, assigned: true }
  var code = await Code.findOneAndUpdate(query,{$set: update});
  return code.code;
}
