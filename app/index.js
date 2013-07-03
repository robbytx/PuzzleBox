var express = require("express"),
	port = process.env.PORT || 5000,
	app = express();

// Set up the settings
require("./settings")(app);

// Set up the models
require("./models/");

// Set up the router
require("./routes")(app);

// Set up all the shiny puzzles!
require('../puzzles');

// Good to go
app.listen(port, function () {
	console.log("PuzzleBox listening on port %d in %s mode", port, app.settings.env);
});
