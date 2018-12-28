var mongoose = require('mongoose');

// define the schema for our user model
var reviewsSchema = mongoose.Schema({
    description   : {
		type : String,
		required : true
	},
    author : {
		type : String,
		required : true
	},
	restaurantId : {
		type : Number,
		required : true
	},
	createdAt: {type: Date, default: Date.now},
  	updatedAt: {type: Date, default: Date.now},
    image : {
		type : String,
	},
  location: {
   type: { type: String },
   coordinates: []
  },
});

// create the model for Reviews and expose it to our app
module.exports = mongoose.model('Reviews', reviewsSchema);
