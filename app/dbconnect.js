var mongoose = require("mongoose"),
	mongo_uri = (process.env.MONGO_URI || "mongodb://localhost:27017/bvpuzzle"),
	redis;

exports.conf = {
	db: "bvpuzzle",
	host: (process.env.MONGO_HOST || "localhost"),
	port: (process.env.MONGO_PORT || 27017)
}

// Connect to mongodb
mongoose.connect(mongo_uri);

