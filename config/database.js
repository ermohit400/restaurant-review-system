//fetched constants
var config = require('./constants'); 

module.exports = {
  'secret':config.secret,
  'database': 'mongodb://localhost/restaurant'
};