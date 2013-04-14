
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/restart', routes.restart);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//server side using socket.io
var io = require('socket.io').listen(server);
io.set('log level',1);
// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


// keep track of num of players
var numConnected = 0;
var numOfPlayers = 0;
var numReadyPlayers = 0;
var color = null;
var turn = null;
var name = null;
var p1 = null;
var p2 = null;

io.sockets.on('connection', function(socket){
    console.log('===================');
    console.log('connection');
    console.log('current number of players : ' + numOfPlayers);

    io.sockets.emit('show num online', {
      numOnline : ++numConnected
    });

  if(numOfPlayers>=2) {
    socket.emit('add message', {
      author : 'Arbiter',
      message : 'How I wish to see you play! Unfortunately, the Game Server is Full.'
    });
    socket.emit('add message', {
      author : 'Arbiter',
      message : 'Come back again later, okay?'
    });
    socket.emit('full');
  } else {
    socket.emit('initial connect');
  }

  socket.on('player connect', function(data){
    console.log('===================');
    console.log('player connect');

    ++numOfPlayers;

    switch(numOfPlayers){
      case 1 :
        color = 'white';
        p1 = data.name;
        break;
      case 2 :
        color = 'black';
        p2 = data.name;
        break;
    }

    socket.broadcast.emit('add message', {
      author : 'Arbiter',
      message : 'Opponent "' + data.name + '" is connected to the Game.'
    });

    socket.emit('add message', {
      author : 'Arbiter',
      message : 'You are connected to the Game.'
    });

    console.log("General " + data.name + " connected with ID" + numOfPlayers);
    socket.emit('player assign', {'id' : numOfPlayers, 'color' : color});

    if(numOfPlayers == 2) {
        console.log('2 players connected, GAME START!');
        io.sockets.emit('game start');
        io.sockets.emit('add message', {
          author : 'Arbiter',
          message : p1 + ' vs ' + p2
        });
        io.sockets.emit('add message', {
          author : 'Arbiter',
          message : 'Start the Game of the Generals!'
        });        
    }
    console.log('===================');
  });

  socket.on('player ready', function(data){
    console.log('=== socket on : player ready');
    console.log('General ' + data.name + ' is ready to start the Game.');

    socket.broadcast.emit('add message', {
      author : 'Arbiter',
      message : 'General ' + data.name + ' is ready to start the Game.'
    });

    numReadyPlayers++;
        if(numReadyPlayers == 2) {
        console.log('Both Generals are ready, start the War!');
        io.sockets.emit('war start', {turn : 'white', name : p1});
        turn = 'white';

    io.sockets.emit('add message', {
      author : 'Arbiter',
      message : 'Both Generals are ready, start the War!'
    });

    io.sockets.emit('add message', {
      author : 'Arbiter',
      message : 'It is now General ' + p1 + '\'s turn.'
    });

    }
    console.log('===================');
  });

  socket.on('place piece', function(data){
    console.log('=== socket on : place piece');
    console.log('General ' + data.name + ' placed a Piece in cell[' + data.cell + ']');
    socket.broadcast.emit('place piece', {cell : data.cell });
    socket.broadcast.emit('add message', {
      author : 'Arbiter',
      message : 'General ' + data.name + ' placed a Piece in cell[' + data.cell + ']'
    });
    console.log('===================');
  });

  socket.on('move piece', function(data){
    console.log('=== socket on : move piece');
    console.log('It is now General '+turn+'s turn');
    console.log('General ' + data.crName + ' moved a piece['+ data.piece+'] from cell ' + data.srcCell + ' to cell ' + data.destCell);
    var winnerPiece, winnerName;
    var end = false;

    if(data.piece==='Flag' && data.destCell[1] === '8' && data.crName === p1 ) {
        winnerName = data.crName;
        end = true;
    }
    if(data.piece==='Flag' && data.destCell[1] === '1' && data.crName === p2 ) {
        winnerName = data.crName;
        end = true;
    }

    if(end){
      io.sockets.emit('end game', {
            'winnerName' : data.crName,
      });
      io.sockets.emit('add message', {
        author : 'Arbiter',
        message : 'General ' + data.crName + ' has won the Game!'
      });
    }

    socket.broadcast.emit('move piece', {
          'srcCell' : data.srcCell,
          'destCell' : data.destCell,
          'end' : end
      });

    if(data.challenge){
        socket.broadcast.emit('challenge start', {
          'crName' : data.crName,
          'destCell' : data.destCell,
          'srcCell' : data.srcCell,
          'challenger' : data.piece});
    }

    io.sockets.emit('add message', {
      author : 'Arbiter',
      message : 'General ' + data.crName + ' moved a piece to cell ' + data.destCell
    });
    console.log('===================');
  });

  socket.on('challenge end', function(data){
    console.log('=== socket on : challenge end');
    var winnerPiece = null;
    var winnerName = null;
    var loserPiece = null;
    var loserName = null;
    var end = false;

    var tie = null;
    var cr = data.challenger;
    var crName = data.crName;
    var ce = data.challengee;
    var ceName = data.ceName;
    var destination = data.destCell;
    var crColor = data.color;

    var ranks = [
    'Five-star General',
    'Four-star General',
    'Three-star General',
    'Two-star General',
    'One-star General',
    'Colonel',
    'Lt. Colonel',
    'Major',
    'Captain',
    '1st Lieutenant',
    '2nd Lieutenant',
    'Sergeant'];

    if(cr === ce)
      tie = true;
    else
      tie = false;


    // Checks for SPY challenges
    if(cr === 'Spy') {
      if(ce === 'Private'){
        winnerPiece = ce;
        winnerName = ceName;
        loserPiece = cr;
        loserName = crName;
      } else{
        winnerPiece = cr;
        winnerName = crName;
        loserPiece = ce;
        loserName = ceName;
        }
    }

    // Checks for PRIVATE challenges
    if(cr === 'Private') {
      if(ce === 'Spy' || ce === 'Flag'){
        winnerPiece = cr;
        winnerName = crName;
        loserPiece = ce;
        loserName = ceName;
      } else {
        winnerPiece = ce;
        winnerName = ceName;
        loserPiece = cr;
        loserName = crName;
        }
    }

    // Checks for FIVE-STAR GENERAL to SERGEANT challenges
    if(cr === ranks[ranks.indexOf(cr)]) {
      if(ce === 'Spy' || ranks.slice(0,(ranks.indexOf(cr))).indexOf(ce) > -1 ){
        winnerPiece = ce;
        winnerName = ceName;
        loserPiece = cr;
        loserName = crName;
      } else{
        winnerPiece = cr;
        winnerName = crName;
        loserPiece = ce;
        loserName = ceName;
        }
    }

    // Flag vs Flag clash
    if(cr === 'Flag' && ce === 'Flag') {
        winnerPiece = cr;
        winnerName = crName;
        loserPiece = ce;
        loserName = ceName;
        end = true;
    }
    if (cr === 'Flag'){
        winnerPiece = ce;
        winnerName = ceName;
        loserPiece = cr;
        loserName = crName;
        end = true;
    }
    if (ce === 'Flag'){
        end = true;
    }
    console.log('Challenger['+crName +']['+cr+'] vs Challengee['+ceName +']['+ce+']');
    console.log('Winner : ' + winnerName + '[' + winnerPiece + ']');
    console.log('Was there a tie? ' + tie);
    console.log('Is the game over? ' + end);

    io.sockets.emit('challenge complete', {'winner' : winnerPiece, 'destCell' : destination, 'tie' : tie, 'end' : end, 'winnerName': winnerName});

    if(tie && ce != 'Flag' && cr != 'Flag'){
      io.sockets.emit('add message', {
          author : 'Arbiter',
          message : 'The Challenge was a tie, both Pieces[' + loserPiece +'] removed.'
        });
    }else {
      io.sockets.emit('add message', {
        author : 'Arbiter',
        message : 'General ' + winnerName + ' won the "Challenge"!'
      });
    }

    if(!tie && cr === winnerPiece){
    socket.emit('add message', {
        author : 'Arbiter',
        message : 'General ' + loserName + ', you lost your Piece[' + loserPiece + '] in the "Challenge"!'
      });
    }

    if(!tie && ce === winnerPiece){
    socket.broadcast.emit('add message', {
        author : 'Arbiter',
        message : 'General ' + loserName + ', you lost your [' + loserPiece + '] in the "Challenge"!'
      });
    }

    if(end){
      io.sockets.emit('add message', {
        author : 'Arbiter',
        message : 'General ' + winnerName + ' has won the Game!'
      });
    }

    console.log('===================');
  });

  socket.on('change turn', function(data){
    console.log('=== socket on : change turn');
    turn = data.turn;
    if(turn==='white')
      name = p1;
    else
      name = p2;
    io.sockets.emit('change turn', {'turn' : turn, 'name' : name});
    socket.broadcast.emit('add message', {
      author : 'Arbiter',
      message : 'It is now General ' + name + '\'s turn.'
    });
    console.log('It is now General ' + name + '\'s turn.');
    console.log('===================');
  });

  socket.on('add message', function(data){
    console.log('=== socket on : add message');
    console.log(data.author + ' said : ' + data.message);
    io.sockets.emit('add message', {
      author : 'General ' + data.author,
      message : data.message
    });
    console.log('===================');
  });

  socket.on('disconnect', function(){
    console.log('=== socket on : disconnect');
    console.log('Client disconnect');
    // io.sockets.emit('client disconnect', {
    //   author : 'Arbiter',
    //   message : 'A Player has left the game'
    // });
    io.sockets.emit('show num online', {
      numOnline : --numConnected
    });
    console.log('===================');
  });

  socket.on('restart', function(){
    console.log('=== socket on : restart');
    console.log('Server restart');
    numOfPlayers = 0;
    numReadyPlayers = 0;
    numConnected = 0;
    color = null;
    turn = null;
    name = null;
    p1 = null;
    p2 = null;
    console.log('===================');
  });

  socket.on('reconnect', function(){
    console.log('=== socket on : reconnect');
    console.log('Client reconnected');

  });
    console.log('===================');
});