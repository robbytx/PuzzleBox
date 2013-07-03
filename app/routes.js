var credentialController = require('./controllers/credential'),
	indexController = require('./controllers/indexController'),
	puzzleController = require('./controllers/puzzles'),
	passport = require('passport'),
	helpers = require('./controllers/helpers');

module.exports = function(app){

	// Landing page route
	app.get('/', indexController.renderIndex);

	// Puzzlllleeeessss
	app.get('/puzzles', helpers.requireLogin, puzzleController.renderIndex);
	app.get('/puzzles/:puzzid', helpers.requireLogin, puzzleController.getPuzzle, puzzleController.renderPuzzle);
	app.post('/puzzles/:puzzid', helpers.requireLogin, puzzleController.getPuzzle, puzzleController.checkPuzzle);

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
