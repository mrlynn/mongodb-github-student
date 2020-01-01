/*
 * Database configuration
 */

const mongoose = require('mongoose');
const constants = require('./constants');

mongoose.Promise = global.Promise;

try {
  mongoose.connect(constants.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
} catch (err) {
  mongoose.createConnection(constants.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
}
