var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// define the schema for our user model
const userSchema = mongoose.Schema({
	email : {
		type : String,
		lowercase: true,
		required : true,
		unique : true
	},
	password : {
		type : String,
		required : true 
	},
	image : {
		type : String,
	}
});

// Saves the user's password hashed (plain text password storage is not good)
userSchema.pre('save', function (next) {  
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Create method to compare password input to password saved in database
userSchema.methods.comparePassword = function(pw, cb) {  
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
