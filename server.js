
/**
 * Module dependencies.
 */

                    require('coffee-script');

var express       = require('express')
  , http          = require('http')
  , mongoose      = require('mongoose');

var app           = express()
  , config        = require('./apps/config.coffee')(app, express, mongoose)
  , models        = {};

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// MODELS
// models.user = require('./models/user')(mongoose).model;

// ROUTES
require('./apps/game/routes')(app);
// require('./apps/authentication/routes')(app, models.user);

// SOCKET.IO STUFF
require('./apps/sockets')(server);

module.exports = app;