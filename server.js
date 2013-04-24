
/**
 * Module dependencies.
 */

                    require('coffee-script');

var express       = require('express')
  , routes        = require('./routes')
  , http          = require('http')
  , mongoose      = require('mongoose');

var app           = express()
  , config        = require('./apps/config')(app, express, mongoose)
  , models        = {};

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// MODELS
models.user = require('./models/user')(mongoose).model;

// ROUTES
app.get('/', routes.index);
app.get('/restart', routes.restart);
require('./apps/authentication/routes')(app, models.user);

// SOCKET.IO STUFF
require('./apps/sockets')(server);

module.exports = app;