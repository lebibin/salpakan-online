routes = (app, model) ->

	helpers = require './helpers'

	app.get '/login', (req, res) ->
		if req.session.user
			res.redirect '/admin'
		res.render "#{__dirname}/views/login"

	app.post '/login', (req, res) ->
		model.findOne(req.body).exec (err, foundUser) ->
			throw err if err
			if foundUser
				req.session.user = foundUser.username
				res.redirect '/admin'
			else
				res.send 'Invalid username and/or password.'

	app.get '/admin', helpers.checkAuth, (req, res) ->
		res.header 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
		res.send 'Admin page Yipeee!'

	app.get '/adminpage', helpers.checkAuth, (req, res) ->
		res.header 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
		res.send 'Another admin page Yipeee!'

	app.get '/logout', (req, res) ->
		if req.session.user
			req.session.user = null
			res.clearCookie 'user'
			req.session.destroy()
			res.send 'You have successfully logged out!'
		res.redirect '/login'

module.exports = routes