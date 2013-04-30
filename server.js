
/**
 * Module dependencies.
 */
					require('nodefly').profile(
					    '87f443a0-2f10-42bf-bf3f-c124ac06d139',
					    [process.env.APPLICATION_NAME,'Heroku']
					);

                    require('coffee-script');

var express       = require('express')
  , http          = require('http')
  , mongoose      = require('mongoose');

var app           = express()
  , config        = require('./apps/config')(app, express, mongoose)
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