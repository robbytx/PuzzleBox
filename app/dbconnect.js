var express = require('express'),
	mongoose = require("mongoose"),
	MongoStore = require('connect-mongo')(express),
	mongo_uri = (process.env.MONGO_URI || "mongodb://localhost:27017/bvpuzzle"),
	redis;

// Connect to mongodb - two connections due to two different use cases, but sue me.
mongoose.connect(mongo_uri);

exports.db = new MongoStore({url: mongo_uri});
