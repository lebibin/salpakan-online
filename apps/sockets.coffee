sockets = (server) ->
	# server-side using socket.io
	io = require('socket.io').listen server
	io.set 'log level', 1

	# assuming io is the Socket.IO server object
	io.set 'transports', ['xhr-polling']
	io.set 'polling-duration', 10

	# # TESTING AUTH

	# io.set 'authorization', (handshakeData, accept) ->
	# 	if handshakeData.headers.cookie
	# 		handshakeData.cookie = cookie.parse handshakeData.headers.cookie
	# 		handshakeData.sessionID = connect.utils.parseSignedCookie handshakeData.cookie['express.sid'], 'get you effin shit together'
	# 		if handshakeData.cookie['express.sid'] is handshakeData.sessionID
	# 			return accept 'Cookie is invalid', false
	# 		else
	# 			return accept 'No cookie transmitted.', false


	# 		accept null, true

	# # END TESTING AUTH

	numOfConnected = 0		# number of connected players tracker
	numOfPlayersInRoom = {} # num of TOTAL players connected in a ROOM
	numOfConnectedPlayersInRoom = {} # num of players who have inputted their name
	rooms = {}
	numOfReadyPlayers = {}	# num of READY players, those who emited 'player ready' increments this variable
	turn = name = p1 = p2 = player = {}	# various trackers

	io.sockets.on 'connection', (socket) ->
		console.log '==================='

		room = null #	VAR to hold this socket's room that he/she will be joining

		++numOfConnected
		console.log 'socket connection established'
		console.log 'current number of players : ' + numOfConnected

		# GLOBAL - EMIT EVENT FOR SHOWING NUMBER OF ONLINE PLAYERS
		io.sockets.emit 'show num online',
			numOnline : numOfConnected

		socket.emit 'initialize room' # to get the room the player wants to join in

		# INITIALIZE A ROOM
		socket.on 'initialize room', (data) ->
			room = data.room

			numOfPlayersInRoom[room] = unless numOfPlayersInRoom[room]? then 0 else numOfPlayersInRoom[room]
			
			if numOfPlayersInRoom[room] >= 2
				room = null
				socket.emit 'add message',
					author : 'Arbiter'
					message : 'How I wish to see you play! Unfortunately, this Room is Full.'
				socket.emit 'add message',
					author : 'Arbiter'
					message : 'Refresh the page, then try another Room.'
				socket.emit 'full'
			else
				socket.join room
				socket.emit 'add message',
					author : 'Arbiter'
					message : "You joined the Room with the Password[#{room}]"
				socket.emit 'initial connect'

				++numOfPlayersInRoom[room]

			if numOfPlayersInRoom[room] < 2
				socket.emit 'add message',
					author : 'Arbiter'
					message : "Share this Password[#{room}] with you friend to play against him/her."

		# LEAVING ROOMS, WHEN GAME HAS ENDED
		socket.on 'leave room', (data) ->
			socket.leave data.room
			room = null
			--numOfPlayersInRoom[data.room]
			--numOfConnectedPlayersInRoom[data.room]
			--numOfReadyPlayers[data.room]

		# LISTEN FOR PLAYER CONNECT
		socket.on 'player connect', (data) ->
			console.log('===================')
			console.log('player connect')
			console.log "numOfPlayersInRoom[#{room}]:#{numOfPlayersInRoom[room]}"

			# initialize to prevent sending undefined data
			numOfConnectedPlayersInRoom[room] = unless numOfConnectedPlayersInRoom[room]? then 0 else numOfConnectedPlayersInRoom[room]
			player[room] = unless player[room]? then {} else player[room]

			++numOfConnectedPlayersInRoom[room]
			console.log 'num of connected players in room :' + numOfConnectedPlayersInRoom[room]

			switch numOfConnectedPlayersInRoom[room]
				when 1
					color = 'white'
					player[room]['p1'] = data.name
				when 2
					color = 'black'
					player[room]['p2'] = data.name


			socket.broadcast.to(room).emit 'add message',
				author : 'Arbiter'
				message : 'Opponent "' + data.name + '" is connected to the Game.'

			socket.emit 'add message',
				author : 'Arbiter'
				message : 'You are connected to the Game. Waiting for your opponent...'

			console.log "General #{data.name} connected with ID #{numOfConnectedPlayersInRoom[room]} and color[#{color}]"
			socket.emit 'player assign',
				id : numOfConnectedPlayersInRoom[room]
				color : color

			if numOfConnectedPlayersInRoom[room] is 2
				console.log('2 Players connected, GAME START')
				io.sockets.in(room).emit 'game start'
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : player[room]['p1'] + ' vs ' + player[room]['p2']
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'Start the Game of the Generals!'

			console.log('===================')

		# LISTEN FOR PLAYER READY
		socket.on 'player ready', (data) ->
			console.log('=== socket on : player ready')
			console.log('General ' + data.name + ' is ready to start the Game.')

			socket.broadcast.to(room).emit 'add message',
				author : 'Arbiter'
				message : 'General ' + data.name + ' is ready to start the Game.'

			# initialize to prevent sending undefined data
			numOfReadyPlayers[room] = unless numOfReadyPlayers[room]? then 0 else numOfReadyPlayers[room]

			++numOfReadyPlayers[room]
			console.log "num of ready players in room[#{room}] : #{numOfReadyPlayers[room]}"


			if numOfReadyPlayers[room] is 2
				console.log('Both Generals are ready, start the War!')
				io.sockets.in(room).emit 'war start',
					turn : 'white'
					name : player[room]['p1']

				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'Both Generals are ready, start the War!'

				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'It is now General ' + player[room]['p1'] + '\'s turn.'

			console.log('===================')

		# LISTEN FOR PLACING PIECE DURING PREPARATION
		socket.on 'place piece', (data) ->
			console.log('=== socket on : place piece')
			console.log('General ' + data.name + ' placed a Piece in cell[' + data.cell + ']')
			socket.broadcast.to(room).emit 'place piece',
				cell : data.cell
			socket.broadcast.to(room).emit 'add message',
				author : 'Arbiter'
				message : 'General ' + data.name + ' placed a Piece in cell[' + data.cell + ']'
			console.log('===================')

		# LISTEN FOR MOVING PIECE DURING WAR
		socket.on 'move piece', (data) ->
			console.log('=== socket on : move piece')
			winnerPiece = winnerName = null			# VAR for winning Piece and winner Name during CHALLENGES
			end = false								# CHECK if a flag has been captured or not

			activePiece = data.piece 				# VAR for the piece being move, useful if it's the flag
			activePlayerName = data.crName 			# VAR for the PLAYER who moved the activePiece

			destinationRow = data.destCell[1]	# VAR for checking if the flag reached the opposite end of board

			if activePiece is 'Flag' and destinationRow is '8' and activePlayerName is player[room]['p1'] and data.color is 'white'
				winnerName = activePlayerName
				end = true
			if activePiece is 'Flag' and destinationRow is '1' and activePlayerName is player[room]['p2'] and data.color is 'black'
				winnerName = activePlayerName
				end = true

			if end
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : "General #{data.crName}'s Flag has captured your base, i.e. it reached Row\##{destinationRow}."
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'General ' + data.crName + ' has WON the Game!'
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'Press "F5" or "Refresh" the Page to play again! /GG'
				io.sockets.in(room).emit 'end game',
					winnerName : winnerName

			socket.broadcast.to(room).emit 'move piece',
				srcCell : data.srcCell
				destCell : data.destCell
				end : end

			if data.challenge
				socket.broadcast.to(room).emit 'challenge start',
					crName : activePlayerName
					challenger : activePiece
					destCell : data.destCell
					srcCell : data.srcCell

			unless end
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'General ' + data.crName + ' moved a piece to cell ' + data.destCell

			console.log('===================')

		socket.on 'challenge end', (data) ->
			console.log('=== socket on : challenge end')
			winnerPiece = winnerName = loserPiece = loserName = tie = null
			end = false

			challengerPiece = data.challenger 		# PIECE of the Challenger
			challengerName = data.crName 			# PLAYER NAME of the Challenger
			challengerColor = data.color 			# COLOR of the Challenger

			challengeePiece = data.challengee 		# PIECE of the Challengee
			challengeeName = data.ceName 			# PLAYER NAME of the Challengee

			destination = data.destCell				# VAR for destination cell

			ranks = ['Five-star General',
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
				'Sergeant']

			tie = if challengerPiece is challengeePiece then true else false


			# if CHALLENGER is a SPY
			if challengerPiece is 'Spy'
				if challengeePiece is 'Private'
					winnerPiece = challengeePiece
					winnerName = challengeeName
					loserPiece = challengerPiece
					loserName = challengerName
				else
					winnerPiece = challengerPiece
					winnerName = challengerName
					loserPiece = challengeePiece
					loserName = challengeeName

			# if CHALLENGER is a PRIVATE
			if challengerPiece is 'Private'
				unless challengeePiece is 'Spy' or challengeePiece is 'Flag'
					winnerPiece = challengeePiece
					winnerName = challengeeName
					loserPiece = challengerPiece
					loserName = challengerName
				else
					winnerPiece = challengerPiece
					winnerName = challengerName
					loserPiece = challengeePiece
					loserName = challengeeName

			# for other RANK challenges ( FIVE-START to SERGEANT)
			if challengerPiece is ranks[ranks.indexOf(challengerPiece)]
				if challengeePiece is 'Spy' or ranks.slice(0,(ranks.indexOf(challengerPiece))).indexOf(challengeePiece) > -1
					winnerPiece = challengeePiece
					winnerName = challengeeName
					loserPiece = challengerPiece
					loserName = challengerName
				else
					winnerPiece = challengerPiece
					winnerName = challengerName
					loserPiece = challengeePiece
					loserName = challengeeName

			# FLAG vs FLAG clashes
			if challengerPiece is 'Flag'
				if challengeePiece is 'Flag'
					winnerPiece = challengerPiece
					winnerName = challengerName
					loserPiece = challengeePiece
					loserName = challengeeName
					end = true
				else
					winnerPiece = challengeePiece
					winnerName = challengeeName
					loserPiece = challengerPiece
					loserName = challengerName
					end = true

			# CHECKS if the flag has been captured from above challenges
			if challengeePiece is 'Flag' then end = true


			console.log "Challenger[#{challengerName}][#{challengerPiece}] vs Challengee[#{challengeeName}][#{challengeePiece}]"
			console.log "Winner :  #{winnerName} [ #{winnerPiece} ]"
			console.log('Was there a tie? ' + tie)
			console.log('Is the game over? ' + end)

			io.sockets.in(room).emit 'challenge complete',
				winner : winnerPiece
				destCell : destination
				tie : tie
				end : end
				winnerName : winnerName

			# MESSAGES for CHALLENGE WINNERS
			if tie and challengeePiece isnt 'Flag' and challengerPiece isnt 'Flag'
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : "The Challenge was a tie, both Pieces[#{loserPiece}] removed."
			else
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'General ' + winnerName + ' WON the "Challenge"!'

			# MESSAGE INDIVIDUAL SOCKETS WHAT PIECE HAS BEEN LOST
			if not tie and not end and challengerPiece is winnerPiece
				socket.emit 'add message',
					author : 'Arbiter'
					message : "General #{loserName}, you LOST your \"#{loserPiece}\" in the Challenge!"
			if not tie and not end and challengeePiece is winnerPiece
				socket.broadcast.to(room).emit 'add message',
					author : 'Arbiter'
					message : "General #{loserName}, you LOST your \"#{loserPiece}\" in the Challenge!"

			# MESSAGE FOR GAME END, WHO WON?
			if end
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : "General #{winnerName}'s \"#{winnerPiece}\" has Captured General #{loserName}'s \"Flag\"."
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'General ' + winnerName + ' has WON the Game!'
				io.sockets.in(room).emit 'add message',
					author : 'Arbiter'
					message : 'Press "F5" or "Refresh" the Page to play again! /GG'
			console.log('===================')

		# LISTEN FOR CHANGE TURN DURING WAR
		socket.on 'change turn', (data) ->
			console.log('=== socket on : change turn')
			name = if data.turn is 'white' then player[room]['p1'] else player[room]['p2']

			io.sockets.in(room).emit 'change turn',
				turn : data.turn
				name : name

			io.sockets.in(room).emit 'add message',
				author : 'Arbiter'
				message : "It is now General #{name}\'s turn."

			console.log("It is now General #{name}\'s turn.")
			console.log('===================')

		# PROCS on GAME END, show the remaining pieces to opponent
		socket.on 'show pieces', (data) ->
			console.log('=== socket on : show pieces')
			socket.broadcast.to(room).emit 'show pieces',
				remaining_pieces : data.remaining_pieces


		# LISTEN FOR CHAT MESSAGES
		socket.on 'add message', (data) ->
			console.log('=== socket on : add message')
			console.log data.author + ' said : ' + data.message
			io.sockets.in(room).emit 'add message',
				author : 'General ' + data.author
				message : data.message
			console.log('===================')

		# LISTEN FOR DISCONNECTTs
		socket.on 'disconnect', ->
			console.log('=== socket on : disconnect')
			console.log('Client disconnect')
			# numOfPlayersInRoom[room] = null
			# numOfConnectedPlayersInRoom[room] = null
			# numOfReadyPlayers[room] = null
			# io.sockets.in(room).emit 'add message',
			# 	author : 'Arbiter'
			# 	message : 'Player disconnected.'
			# io.sockets.in(room).emit 'add message',
			# 	author : 'Arbiter'
			# 	message : 'Press "F5" or "Refresh" the Page to play again! /GG'
			io.sockets.in(room).emit 'show num online',
				numOnline : --numOfConnected
			console.log('===================')

		# # LISTEN FOR RESTARTS
		# socket.on 'restart', ->
		# 	console.log('=== socket on : restart')
		# 	console.log('Server restart')
		# 	numOfConnected = numOfReadyPlayers = 0
		# 	turn = name = p1 = p2 = {}
		# 	console.log('===================')

		# LISTEN FOR RECONNECTS
		socket.on 'reconnect', ->
			console.log('=== socket on : reconnect')
			console.log('Client reconnected')
			console.log('===================')

		console.log '==================='

module.exports = sockets