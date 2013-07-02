var mongoose = require('mongoose'),
	deferred = require('deferred'),
	Schema = mongoose.Schema,
	User = new Schema({
		name: String,
		credential_type: String,
		credential_id: String,	
		created: {type: Date, default: Date.now},
		accessed: {type: Date, default: Date.now}
	});

// Find a user by given credential
User.statics.findOrAddByCredential = function findByCredential (profile) {
	var query = {};

	query["credential_id"] = profile.id;
	query["credential_type"] = profile.provider;

	return this.pFindOne(query)(function(user) {
		if (user) {
			user.accessed = Date.now();
			return user.pSave();
		} else {
			user = new (mongoose.model('User'))();
			user.name = profile.displayName;
			user.credential_type = profile.provider;
			user.credential_id = profile.id
			return user.pSave();
		}
	});
};

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
