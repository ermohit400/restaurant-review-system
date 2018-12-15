var express = require('express');
var router 	= express.Router();
var jwt 	= require('jsonwebtoken');  
var config 	= require('../../config/constants'); 
var passport= require('passport');

//initialize models
var User  	= require('../models/user');
var Reviews = require('../models/reviews');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST login method. */
router.post('/login', function(req, res) {
    User.findOne({
	    email: req.body.email
	  }, function(err, user) {
	    if (err){
	    	res.send({ success: false, message: err });
	    }
	    if (!user) {
	      res.send({ success: false, message: 'Authentication failed. User not found.' });
	      //res.send({ success: false, message: user });

	    } else {
	      // Check if password matches
	      user.comparePassword(req.body.password, function(err, isMatch) {
	        if (isMatch && !err) {
	          // Create token if the password matched and no error was thrown
	          var token = jwt.sign(user.toJSON(), config.secret, {
	            expiresIn: 10080 // in seconds
	          });
	          res.json({ success: true, token: 'JWT ' + token });
	        } else {
	          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
	        }
	      });
	    }
	  });
});

/* POST register method. */
router.post('/register', function(req, res) {  
  if(!req.body.email || !req.body.password) {
    res.json({ success: false, message: 'Please enter email and password.' });
  } else {
    var newUser = new User();
    // set the user's credentials
	newUser.email    = req.body.email;
	newUser.password = req.body.password;

    // Attempt to save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({ success: false, message: err.message});
      }
      res.json({ success: true, message: 'Successfully created new user.' });
    });
  }
});

/* POST reviews method. */
router.get('/list-reviews', function(req, res) {  
    Reviews.find({}, function(err, reviews) {
	    if (err){
	    	res.send({ success: false, message: err });
	    }
	    if (!reviews) {
	      	res.send({ success: false, message: 'Reviews not found.' });
	    } else {
			res.json({ success: true, reviews: reviews });
	    }
	});
});

/* POST create review method. */
router.post('/create-review', passport.authenticate('jwt', { session: false}), function(req, res) {
	var token = getToken(req.headers);
	if (token) {
		var decoded = jwt.decode(token, config.secret);
		User.findOne({
		  email: decoded.email
		}, function(err, user) {
		    if (err) throw err;

		    if (!user) {
		      return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
		    } else {

		    	var newReviews 				= new Reviews();
			    // set the reviews's parameters
			    newReviews.description 		= req.body.description;
				newReviews.author 			= req.body.author;
				newReviews.image 			= req.body.image;
				newReviews.latitude 		= req.body.latitude;
				newReviews.longitude 		= req.body.longitude;

			    // Attempt to save the reviews
			    newReviews.save(function(err) {
			      if (err) {
			        return res.json({ success: false, message: err.message});
			      }
			      res.json({ success: true, message: 'Successfully created new review.' });
			    });
		    }
		});
	} else { 
		return res.status(403).send({success: false, msg: 'No token provided.'});
	}
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
