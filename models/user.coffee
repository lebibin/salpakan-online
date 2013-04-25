user = (mongoose) ->

	collection = 'user'
	Schema = mongoose.Schema
	ObjectId = Schema.ObjectId

	schema = new Schema
		_id : ObjectId
		username : String
		password : String

	@model = mongoose.model collection, schema
	return @

module.exports = user