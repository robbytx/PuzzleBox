var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GithubStrategy = require('passport-github').Strategy
	mongoose = require('mongoose'),
	User = mongoose.model('User');

function authenticateUser(req, accessToken, refreshToken, profile, done) {
	User.findOrAddByCredential(profile)(function(user){
		done(null, user);
	}).end();
}

passport.use(new FacebookStrategy({
		clientID: process.env.FB_APP_ID,
		clientSecret: process.env.FB_APP_SECRET,
		callbackURL: process.env.HOST_PORT + "/auth/facebook/callback",
		passReqToCallback: true
	}, authenticateUser));

passport.use(new TwitterStrategy({
		consumerKey: process.env.TW_APP_KEY,
		consumerSecret: process.env.TW_APP_SECRET,
		callbackURL: process.env.HOST_PORT + "/auth/twitter/callback",
		passReqToCallback: true
	}, authenticateUser));

//Places the user into the session
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

//Retrieves the user from the session
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		if (err) { return done(err); }
		done(null, user);
	});
});

exports.catchRedirectArgs = function(req, res, next) {
	var redirect = decodeURIComponent(req.param('redirect', ''));
	if(redirect !== '') {
		req.session.redirect = redirect;
	} 
	next();
};

exports.redirectAfterLogin = function(req, res) {
	var redirect = req.session.redirect;
	if (req.session.redirect) {
		delete req.session.redirect;
		res.redirect(redirect);
		return;
	}
	res.redirect('/');
};

exports.logout = function (req, res) {
	req.logout();
	res.redirect('/');
};
