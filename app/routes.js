var credentialController = require('./controllers/credential'),
	indexController = require('./controllers/indexController'),
	passport = require('passport'),
	helpers = require('./controllers/helpers');

module.exports = function(app){

	// Landing page routes
	app.get('/', indexController.renderIndex);

	// Authorize credentials routes
	app.get('/auth/facebook', credentialController.catchRedirectArgs, passport.authenticate('facebook'));
	app.get('/auth/facebook/callback', 
			passport.authenticate('facebook'), credentialController.redirectAfterLogin);
	app.get('/auth/twitter', credentialController.catchRedirectArgs, passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', 
			passport.authenticate('twitter'), credentialController.redirectAfterLogin);
	app.get('/auth/github', credentialController.catchRedirectArgs, passport.authenticate('github'));
	app.get('/auth/github/callback', 
			passport.authenticate('github'), credentialController.redirectAfterLogin);

	// Logout
	app.get('/logout', credentialController.catchRedirectArgs, credentialController.logout);

};
