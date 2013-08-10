var express = require("express"),
	dbs = require("./dbconnect"),
	passport = require("passport"),
	csrf = express.csrf();

module.exports = function (app) {

	app.configure(function () {

		// Set up views!
		app.set("view options", {layout: false});
		app.set("views", "./templates");
		app.set("view engine", "jade");

		// Set up a bunch of misc inbound stuff, just know that it's important.
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.limit('4mb'));

		// Sessions use Redis since we don't really care if they expire when we restart.
		// Worst that will happen is that everyone gets logged out.
		app.use(express.session({ 
			secret: process.env.CLIENT_SECRET || "bvpuzzlez",
			maxAge: new Date(Date.now() + (1000 * 60 * 60 * 24)), //One day max session time, or anytime redis restarts.
			store: dbs.redisStore
		}));
		
		// Let's try and avoid cross site attacks if we can...
		app.use(csrf);

		// Setup passport (actual auth schemes are set up as part of ./controllers/credential.js)
		app.use(passport.initialize());
		app.use(passport.session());

		var isProduction = process.env.NODE_ENV === 'production';

		// Automatically make the token and user variables available to the template
		// This must appear after app.use(passport.session());
		app.use(function (req, res, next) {
			app.locals.token = req.session._csrf;
			app.locals.user = req.user;
			app.locals.production = isProduction;
			app.locals.messages = req.session.messages || {};
			delete req.session.messages;
			next();
		});

		// if you don't know what this does you're fired --mikey
		//   ...
		//        (j/k but seriously you should know what this does)
		app.use(app.router);

		// Set up static resources directory
		app.use(express.static("./static/"));

		// In case of 404, respond in the most appropriate way possible.
		app.use(function(req, res, next){			
			if (req.accepts('html')) {
				res.status(404);
				res.render('404', { url: req.url });
				return;
			}
			if (req.accepts('json')) {
				res.send({ error: 'Not found' });
				return;
			}
			res.type('txt').send('Not found');
		});
	});

	// Show full error stack on dev
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	// Only show that an error happened on prod
	// TODO: Nice web page
	app.configure('production', function(){		
		app.use(express.errorHandler());
	});

};
