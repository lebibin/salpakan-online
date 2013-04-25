routes = (app) ->

	app.get '/', (req, res) ->
		res.render "#{__dirname}/views/game",
			title : "Game of the Generals"
	# app.get '/restart', (req, res) ->
	# 	res.render "#{__dirname}/views/restart",
	# 		title : "Restart"

module.exports = routes