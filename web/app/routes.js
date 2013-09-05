var credentialController = require('./controllers/credential'),
	profileController = require('./controllers/profile'),
	leaderboardController = require('./controllers/leaderboard'),
	indexController = require('./controllers/indexController'),
	puzzleController = require('./controllers/puzzles'),
	helpers = require('./controllers/helpers');

module.exports = function(app){

	// Landing page route
	app.get('/', indexController.renderIndex);

	// Profile Info
	app.get('/profile', profileController.showProfile);
	app.post('/profile', profileController.submitProfile);

	// Leaderboard Info
	app.get('/leaderboard', leaderboardController.showLeaderboard)

	// Puzzlllleeeessss
	app.get('/puzzles', helpers.requireLogin, puzzleController.renderIndex);
	app.get('/puzzles/:puzzid', helpers.requireLogin, puzzleController.getPuzzle, puzzleController.renderPuzzle);
	app.post('/puzzles/:puzzid', helpers.requireLogin, puzzleController.getPuzzle, puzzleController.checkPuzzle);

	// Login/logout
	app.post('/send', credentialController.sendLogin);
	app.get('/login', credentialController.doLogin);
	app.get('/logout', credentialController.logout);

};
