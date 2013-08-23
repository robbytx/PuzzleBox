var mongoose = require('mongoose'),
	deferred = require('deferred'),
	crc32 = require('crc').crc32,
	Schema = mongoose.Schema,
	PuzzleCompletion = new Schema({
		puzzleid: String,
		time: {type: Date, default: Date.now}
	});

mongoose.model("PuzzleCompletion", PuzzleCompletion);
var PuzzleCompletionModel = mongoose.model("PuzzleCompletion")

var User = new Schema({
	name: {type: String, default: "Anonymous"},
	email: String,
	created: {type: Date, default: Date.now},
	accessed: {type: Date, default: Date.now},
	completions: [PuzzleCompletion]
});

// Find a user by given credential
User.statics.findOrAddByEmail = function findOrAddByEmail (email) {
	var query = {};

	query["email"] = email;

	return this.pFindOne(query)(function(user) {
		if (user) {
			user.accessed = Date.now();
			return user.pSave();
		} else {			
			user = new (mongoose.model('User'))();
			user.email = email;
			return user.pSave();
		}
	});
};

// Add puzzle completion
User.methods.completePuzzle = function completePuzzle(puzzleid) {
	// Check if this was already completed
	for(var i = 0; i < this.completions.length; i++){
		if (this.completions[i].puzzleid == puzzleid) {return this.completions[i]}
	}

	// If not, add the completion
	var completion = new PuzzleCompletionModel();
	completion.puzzleid = puzzleid;
	this.completions.push(completion);
	return completion;
}

// Get list of completed puzzles
User.methods.getCompletions = function getCompletions() {
	var completions = [];
	for(var i = 0; i < this.completions.length; i++) {
		completions.push(this.completions[i].puzzleid);
	}
	return completions;	
}

// Generate pseudorandom number
User.methods.genNumber = function genNumber(seed, max) {
	return Math.abs(crc32(this.id + seed)) % max;
}

// deferred wrapper for save
User.methods.pSave = function pSave () {
	var def = deferred(),
		that = this;
	this.save(function(err){
		def.resolve(err || that);
	});
	return def.promise;
};

// Add any additional promisified functionality here.
mongoose.model('User', User);
var userProto = mongoose.model('User');
userProto.pFind = deferred.promisify(userProto.find);
userProto.pFindOne = deferred.promisify(userProto.findOne);
userProto.pFindById = deferred.promisify(userProto.findById);
