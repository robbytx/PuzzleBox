var PuzzleMaster = require("../puzzlemaster");

exports.renderIndex = function(req, res) {
	var completed = [], uncompleted = [],
		completions = req.user.getCompletions();

	for (var i in PuzzleMaster.puzzles) {
		if (completions.indexOf(PuzzleMaster.puzzles[i].puzzid) > -1) {
			completed.push(PuzzleMaster.puzzles[i]);
		} else {
			uncompleted.push(PuzzleMaster.puzzles[i]);
		}
	}

	res.render('puzzle_index', {completed: completed, uncompleted: uncompleted});
};

exports.getPuzzle = function(req, res, next) {
	var puzzle = PuzzleMaster.getPuzzle(req.params.puzzid)

	if (puzzle) {
		req.puzzle = puzzle;
		next();
	} else {
		res.redirect('/puzzles');
	}
}

exports.renderPuzzle = function(req, res) {
	res.render("puzzles/" + req.params.puzzid, {
		name: req.puzzle.name,
		puzzle: req.puzzle.puzzleData(req.user),
		failedAnswer: false,
		answerURL: "bah"
	});
}

exports.checkPuzzle = function(req, res) {
	if (PuzzleMaster.checkAnswer(req.puzzle, req.user, req.body.answer)) {
		res.render("correct", {name: req.puzzle.name});
	} else {
		res.render("puzzles/" + req.params.puzzid, {
			name: req.puzzle.name,
			puzzle: req.puzzle.puzzleData(req.user),
			failedAnswer: true,
			answerURL: "bah"
		});
	}
}