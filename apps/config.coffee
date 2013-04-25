config = (app, express, mongoose) ->

	# MongoStore = require('connect-mongo')(express)

	app.configure ->
		app.set 'port', process.env.PORT || 3000
		app.set 'view engine', 'jade'
		app.use express.logger 'dev'
		app.use express.bodyParser()
		app.use express.methodOverride()

		# SESSIONISTA
		# conf object
		# conf =
		# 	db :
		# 		db : 'GameOfTheGenerals'
		# 		host : 'localhost'
		# 		port : 27017
		# 		collection : 'sessions'
		# 	secret : 'get!s!5hsf4your!s!5hsf4shit!s!5hsf4together!s!5hsf4man'
		# app.use express.cookieParser()
		# app.use express.session
		# 	store : new MongoStore conf.db
		# 	secret : conf.secret
		# 	cookie :
		# 		maxAge : 360000
		# SESSIONISTA END

		app.use(express.static("#{__dirname}/../public"))
		app.use app.router
		app.use (req, res, next) ->
			res.render "#{__dirname}/views/404",
				status : 404
				url : req.url
		app.use (err, req, res, next) ->
			res.render "#{__dirname}/views/500",
				status : err.status || 500
				error : err

	app.configure 'development', ->
		app.use express.errorHandler
			dumpExceptions : true
			showStack : true
		# mongoose.connect 'mongodb://localhost:27017/GameOfTheGenerals'

module.exports = config