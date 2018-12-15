var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger 	 = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 

// configuration ======================
var configDB = require('./config/database.js');
mongoose.connect(configDB.database, { useNewUrlParser: true }); // connect to our database

// routes =============================
var indexRouter = require('./app/routes/index');
var usersRouter = require('./app/routes/api');

var app = express();

// Initialize passport for use
var passport = require('passport');
require('./config/passport')(passport);
app.use(passport.initialize()); 

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error: '+err.message);
});

module.exports = app;
