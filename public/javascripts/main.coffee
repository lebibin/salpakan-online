###

	This is the main app script file

###
board = $('#board')
progress = $('#progress')
whiteCells = $('#board ul:gt(4) li')
blackCells = $('#board ul:lt(3) li')

# Game Variables
room = null
name = null
turnCount = 1
state = null
challenge = null # variable to hold whether or not a challenge takes place
activePiece = null # variable to hold the active piece CLICKED
activePos = null # variable to hold the position of the active piece CLICKED
turn = null # variable to hold which color's turn is it

colLabels = 'ABCDEFGHI'

$cover = $ '#cover'
$guide = $ '#guide'
$chat = $ '#chat'
$msg = $ '#msg'
$online = $ '#online'

# Player info
id = null
color = null
piecesToSet = 21


# 1. player connects
# 2. ask for name
# 3. disable inputs, wait for opponent

get_room_name = ->
	$cover.fadeIn(100)

	$form = $ '#room'
	$roomName = $ '#roomName'
	$form.submit $.proxy (e) ->
		e.preventDefault()

		room = htmlspecialchars $roomName.val()
		room = 'default' unless room

		$form.remove()
		pause()
		socket.emit 'initialize room',
			room : room

	$form.fadeIn(100).appendTo $cover
	$roomName.focus()

get_player_name = ->
	$cover.fadeIn(100)

	$form = $ '#name'
	$playerName = $ '#playerName'

	$form.submit $.proxy (e) ->
		e.preventDefault()

		name = htmlspecialchars $playerName.val()
		name = 'No Name' if !name or name.length > 7

		$form.remove()
		change_turn_name name
		pause()
		socket.emit 'player connect',
			name : name

		$chat.fadeIn(100).submit $.proxy (e) ->
			e.preventDefault()

			chatName = name
			msg = htmlspecialchars $msg.val()

			if msg isnt '' and msg.length < 64
				socket.emit 'add message', 
					author : chatName
					message : msg
			$msg.val('')

	$form.fadeIn(100).appendTo $cover
	$playerName.focus()


# START OF GAME - FUNCTIONS
initialize_room =  ->

	$chat.hide()

	# show popout to get player name
	get_room_name()

initialize =  ->

	resume()

	# set listener for each piece
	bind_piece_listeners()

	# show popout to get player name
	get_player_name()

game_start = ->
	resume()
	change_dash_bg color
	$guide.fadeOut 100
	$('#pieces').show()
	state = 'preparation'


# GENERAL USE - FUNCTIONS

htmlspecialchars = (str) ->
	# HTML ENTITIES PORT FOR JAVASCRIPT CREDITS TO http://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
	String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;')

pause = ->
	$cover.fadeIn(100)
	progress.show().appendTo $cover

resume = ->
	$cover.fadeOut(100)
	progress.hide()

unbind_cell_listeners = ->
	$('#board ul li').off 'click'

bind_piece_listeners = ->
	$('.piece').each ->
		$this = $(this)
		$parentLi = $this.parent()
		$parentLi.click ->
			pos = $parentLi.attr 'id'
			if state is 'preparation'
				if (pos is undefined) and (not $parentLi.hasClass('occupied'))
					piece_click this
			else if state is 'war'
				currentRow =  pos[1]
				currentCol = pos[0]

				topCell = currentCol + (parseInt(currentRow) + 1)
				leftCell = (colLabels[colLabels.indexOf(currentCol) - 1]) + currentRow
				rightCell =  ( colLabels[colLabels.indexOf(currentCol) + 1] ) + currentRow
				bottomCell = currentCol + (parseInt(currentRow) - 1)

				#check top
				top_occ = bot_occ = left_occ = right_occ = false 
				if $('li#' + topCell).hasClass('occupied') or currentRow is '8'
					top_occ = true
				if $('li#' + bottomCell ).hasClass('occupied') or currentRow is '1'
					bot_occ = true
				if $('li#' + leftCell ).hasClass('occupied') or currentCol is 'A'
					left_occ = true
				if $('li#' + rightCell).hasClass('occupied') or currentCol is 'I'
					right_occ = true



				#check bottom
				# and ! $('#' + currentCol + (currentRow - 1) ).hasClass 'occupied'
				# #check left
				# and ! $('#' + colLabels[(colLabels.indexOf(currentCol) - 1 )] + currentRow ).hasClass 'occupied'
				# #check right
				# and ! $('#' + colLabels[(colLabels.indexOf(currentCol) + 1 )] + currentRow ).hasClass 'occupied'
				if top_occ and bot_occ and left_occ and right_occ
					console.log 'can\'t move this piece sorry'
				else
					piece_click this

unbind_piece_listeners = ->
	$('.piece').parent().off 'click'

$msgBox = $('#messages ul')
add_message = (data) ->
	$("<li><span class='author'>#{data.author}</span> : #{data.message}</li>").prependTo($msgBox)

$dash = $('#Dash')
$guide = $('#guide')
change_dash_bg = (c) ->
	if c is 'black'
		clr = '#130f30'
	else
		clr = '#FFFFE5'
	$dash.css 'background-color', clr
	$guide.css 'background-color', clr

$turnName = $('#turn')
change_turn_name = (nm) ->
	$turnName.html "General #{nm}"

# BOARD FUNCTIONS
show_allowed_positions = (color) ->
	if state is 'preparation'
		if color is 'black'
			blackCells.addClass('legal')
		# set listeners for each cell in the board
			.each ->
				cell = $ this
				unless cell.hasClass 'occupied'
					cell.click ->
						square_click this
		else if color is 'white'
			whiteCells.addClass('legal')
			.each ->
				cell = $ this
				unless cell.hasClass 'occupied'
					cell.click ->
						square_click this
		else
			console.log 'unknown color'
	else if state is 'war'
		cellRow = activePos[1]
		cellCol = activePos[0]
		#check top
		if cellRow isnt '8'
			topCell = cellCol + (parseInt(cellRow) + 1)
			$topCell = $('li#'+topCell)
			unless $topCell.hasClass('occupied')
				if $topCell.hasClass 'opponent'
					$topCell.removeClass('opponentMoved').addClass('challenge')
				else
					$topCell.addClass('legal')
				$topCell.click ->
					square_click this
		#check left
		if cellCol isnt 'A'
			leftCell = (colLabels[colLabels.indexOf(cellCol) - 1]) + cellRow
			$leftCell = $('li#'+leftCell)
			unless $leftCell.hasClass('occupied')
				if $leftCell.hasClass 'opponent'
					$leftCell.removeClass('opponentMoved').addClass('challenge')
				else
					$leftCell.addClass('legal')
				$leftCell.click ->
					square_click this
		#check right
		if cellCol isnt 'I'
			rightCell =  ( colLabels[colLabels.indexOf(cellCol) + 1] ) + cellRow
			$rightCell = $('li#'+rightCell)
			unless $rightCell.hasClass('occupied')
				if $rightCell.hasClass 'opponent'
					$rightCell.removeClass('opponentMoved').addClass('challenge')
				else
					$rightCell.addClass('legal')
				$rightCell.click ->
					square_click this
		#check bottom					
		if cellRow isnt '1'
			bottomCell = cellCol + ( parseInt(cellRow) - 1)
			$bottomCell = $('li#'+bottomCell)
			unless $bottomCell.hasClass('occupied')
				if $bottomCell.hasClass 'opponent'
					$bottomCell.removeClass('opponentMoved').addClass('challenge')
				else
					$bottomCell.addClass('legal')
				$bottomCell.click ->
					square_click this
					

reset_allowed_colors = ->
	$('#board ul li').removeClass 'legal challenge '

reset_all_colors = ->
	$('#board ul li').removeClass 'legal'

reset_lmove_color = ->
	$('#board ul li').removeClass 'lmove opponentMoved'

piece_click = (piece) ->
	$piece = $(piece)
	activePiece = piece
	if state is 'war'
		activePos = $piece.attr 'id'
	$piece.addClass('active')
	unbind_cell_listeners()
	unbind_piece_listeners()
	show_allowed_positions color

square_click = (li) ->
	if activePiece
		$li = $(li)
		$activePiece = $(activePiece)
		span = $activePiece.html()
		$span = $(span)
		$span.appendTo($li)
		destinationCell = $li.attr('id')

		if state is 'preparation'
			if destinationCell[0] is 'F' or destinationCell[0] is 'G' or destinationCell[0] is 'H' or destinationCell[0] is 'I'
				$span.addClass('hint--left')
			else
				$span.addClass('hint--right')
			desc = $span.attr 'title'
			$span.removeAttr('title').attr 'data-hint', desc
			$activePiece.removeClass('active').fadeOut(100)
			--piecesToSet
			$li.addClass('occupied').off 'click'
			socket.emit 'place piece',
				cell : destinationCell
				name : name
			if piecesToSet is 0
				$('#pieces').hide()
				$guide.fadeIn 100
				pause()
				socket.emit 'player ready',
					name : name


		else if state is 'war'
			sourceCell = $activePiece.attr('id')
			selectedPiece  = $($activePiece.find('.piece img')).attr('alt')
			$activePiece.removeClass('active occupied').children('.piece').remove()
			$li.addClass 'occupied'

			if $li.hasClass 'challenge'
				challenge = true
			else
				challenge = false

			socket.emit 'move piece',
				crName : name
				srcCell : sourceCell # $activePiece.parent().attr 'id'
				destCell : destinationCell
				piece : selectedPiece
				challenge : challenge
				color : color


		reset_allowed_colors()
		bind_piece_listeners()

		activePiece = null
		activePos = null

place_piece = (data) ->
	$('li#'+data.cell).addClass 'opponent'

# START OF WAR - FUNCTIONS
war_start = (data)->
	unbind_cell_listeners()
	unbind_piece_listeners()
	bind_piece_listeners()
	reset_all_colors()
	resume()
	state = 'war'
	check_turn data


check_turn = (data) ->
	turn = data.turn
	change_turn_name data.name
	change_dash_bg turn
	if turn is color
		resume()
	else
		pause()

change_turn = ->
	if turn is 'white'
		turn = 'black'
	else if turn is 'black'
		turn = 'white'
	else
		console.log 'change_turn error'
	socket.emit 'change turn', turn : turn


move_piece = (data) ->
	reset_lmove_color()
	$('li#'+data.destCell).addClass 'opponentMoved opponent'
	$('li#'+data.srcCell).addClass('lmove').removeClass 'opponent'


test_challenge = (data) ->
	piece = $('li#'+data.destCell).find('.piece img').attr 'alt'
	socket.emit 'challenge end',
		challengee : piece
		ceName : name
		destCell : data.destCell
		challenger : data.challenger
		crName : data.crName
		color : color

set_challenge_winner = (data) ->
	$destLi = $('#'+data.destCell)
	if data.tie
		$destLi.find('img[alt="'+data.winner+'"]').parent().remove()
		$destLi.removeClass 'opponent opponentMoved occupied'
	else
		if (($destLi.find('img[alt="'+data.winner+'"]')).length) isnt 0
			$destLi.removeClass 'opponent opponentMoved'
			play_sound 'points', false
		else
			$destLi.find('img[alt!="'+data.winner+'"]').parent().remove()
			$destLi.removeClass 'occupied'
	unbind_cell_listeners()
	bind_piece_listeners()

	if data.end
		show_winner data


show_remaining_pieces = ->
# show your pieces to opponent, since game is already over.
	remaining_pieces = []
	$piece = $('.piece').each ->
		$this = $(this)
		piece =
			cell : $this.parent().attr 'id'
			piece : $this.parent().html()
		remaining_pieces.push piece
	socket.emit 'show pieces',
		remaining_pieces : remaining_pieces

show_winner = (data) ->
	tempName = data.winnerName
	if name is data.winnerName
		sub = "Well played, congratulations!"
		play_sound 'win', true
	else
		sub = "You've been outplayed, sorry."
		play_sound 'lose', true
	resume()
	result = """
  <div id='result'>
      <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />
      <hr />
      <h1>General #{tempName}<br/>has WON!</h1>
      <hr />
      <h2>#{sub}</h2>
  </div>
	"""
	$cover.fadeIn(100)
	$(result).appendTo $cover

	socket.emit 'leave room',
		room : room

show_pieces =  (data) ->
	remaining_pieces = data.remaining_pieces
	for index of remaining_pieces
		$('li#'+remaining_pieces[index].cell).html(remaining_pieces[index].piece)


# FULL

show_full = ->
	full = """
  <div id='result'>
      <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />
      <hr />
      <h1>Sorry this ROOM is FULL!</h1>
      <hr />
      <h2>Refresh the page, then try another Room.</h2>
  </div>
	"""
	$cover.fadeIn(100)
	$(full).appendTo $cover


# CONTROL THE SOUNDS

sound = new Audio()
play_sound = (fn, looop) ->
	if sound.canPlayType 'audio/mpeg'
		sound.src = 'audio/' + fn + '.mp3'
	else if sound.canPlayType 'audio/ogg'
		sound.src = 'audio/' + fn + '.ogg'
	else
		sound.src = null

	sound.loop = looop

	if sound.src
		sound.load()
		sound.play()


# START TEH GAME


# connect to socket.io
socket = io.connect()

#	Socket.io listeners

socket.on 'initialize room', ->
	play_sound 'title_sound', true
	initialize_room()

socket.on 'initial connect', ->
	initialize()

socket.on 'player assign', (data) ->
	# console.log 'socket.on player assign'
	id = data.id
	color = data.color

socket.on 'game start', (data) ->
	# console.log 'socket.on game start'
	play_sound '', false
	game_start()

socket.on 'war start', (data) ->
	# console.log 'socket.on war start'
	turn = data.turn
	war_start data

socket.on 'change turn', (data) ->
	# console.log 'socket.on change turn'
	check_turn data

socket.on 'place piece', (cell) ->
	play_sound 'move', false
	# console.log 'place piece'
	place_piece cell

socket.on 'move piece', (data) ->
	# console.log 'move piece'
	play_sound 'move', false
	move_piece data
	if not data.end
		change_turn()

socket.on 'end game', (data) ->
	# console.log 'end game'
	show_winner data

socket.on 'show remaining', ->
	show_remaining_pieces()

socket.on 'show pieces', (data) ->
	# console.log 'show pieces'
	show_pieces data

socket.on 'challenge start', (data) ->
	# console.log 'challenge start'
	test_challenge data

socket.on 'challenge complete', (data) ->
	# console.log 'challenge end'
	play_sound 'challenge', false
	set_challenge_winner data

socket.on 'add message', (data) ->
	# console.log 'add message'
	add_message data

socket.on 'full', ->
	# console.log 'full'
	resume()
	show_full()
	socket.disconnect()

socket.on 'show num online', (data) ->
	# console.log 'show num online'
	$online.html data.numOnline