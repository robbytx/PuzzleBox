var express = require('express'),
	mongoose = require("mongoose"),
	RedisStore = require('connect-redis')(express),
	mongo_uri = (process.env.MONGOLAB_URI || "mongodb://localhost:27017/bvpuzzle"),
	redis;

// Connect to mongodb
mongoose.connect(mongo_uri);
redis = require("redis").createClient();

exports.redis = redis;
exports.redisStore = new RedisStore({client: redis});
