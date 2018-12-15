var express = require('express');
var router 	= express.Router();
var jwt 	= require('jsonwebtoken');  
var config 	= require('../../config/constants'); 
var passport= require('passport');
var ObjectId = require('mongodb').ObjectID;

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

const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({dest: "../../public"});

/* POST create review method. */
router.post('/create-review', passport.authenticate('jwt',{session: false}), function(req, res) {
	//console.log('888888: ',req.body);
	var token = getToken(req.headers);
	if (token) {
		var decoded = jwt.decode(token, config.secret);
		User.findOne({
		  email: decoded.email
		}, function(err, user) {
		    if (err){
	    		return res.status(403).send({success: false, msg: err});
		    }
		    if (!user) {
		      return res.status(403).send({success: false, msg: 'Authentication failed.'});
		    } else {
		    	
		    	var newReviews 				= new Reviews();
			    newReviews.description 		= req.body.description;
			    newReviews.restaurantId 	= req.body.restaurantId;
				newReviews.author 			= user.email;
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

/* POST update review method. */
router.post('/:id/update-review', passport.authenticate('jwt',{session: false}), function(req, res) {
	var token = getToken(req.headers);
	if (token && req.params.id) {
		var decoded = jwt.decode(token, config.secret);
		User.findOne({
		  email: decoded.email
		}, function(err, user) {
		    if (err){
	    		return res.status(403).send({success: false, msg: err});
		    }
		    if (!user) {
		      return res.status(403).send({success: false, msg: 'Authentication failed.'});
		    } else {
		    	var reviewId = req.params.id;
		    	Reviews.findOneAndUpdate(
		    		{'_id': new ObjectId(reviewId), author: user.email },
		    		{$set: {
			    				description: 	req.body.description,
								restaurantId: 	req.body.restaurantId,
								latitude: 		req.body.latitude,
								longitude: 		req.body.longitude
		    				}
		    		},
		    		function(err, obj){
		    		if(err){
		    			return res.status(403).send({success: false, msg: err});			
		    		}else{
		    			res.json({ success: true, message: 'Successfully updated review.' });
		    		}
		    	});
		    }
		});
	} else { 
		return res.status(403).send({success: false, msg: 'No token provided or review id sent'});
	}
});

/* POST delete review method. */
router.post('/:id/delete-review', passport.authenticate('jwt',{session: false}), function(req, res) {
	var token = getToken(req.headers);
	if (token && req.params.id) {
		var decoded = jwt.decode(token, config.secret);
		User.findOne({
		  email: decoded.email
		}, function(err, user) {
		    if (err){
	    		return res.status(403).send({success: false, msg: err});
		    }
		    if (!user) {
		      return res.status(403).send({success: false, msg: 'Authentication failed.'});
		    } else {
		    	var reviewId = req.params.id;
		    	Reviews.findOne({'_id': new ObjectId(reviewId), author: user.email },function(err, review){
		    		if(err){
	    				return res.status(403).send({success: false, msg: err});
		    		}
		    		if(!review){
		    			return res.status(403).send({success: false, msg: 'Review not found.'});
		    		}else{
		    			review.remove();
		    		}
		    	});
		    }
		});
	} else { 
		return res.status(403).send({success: false, msg: 'No token provided or review id sent'});
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
