var PuzzleMaster = require("../puzzlemaster");

exports.renderIndex = function(req, res) {
	res.render('puzzle_index', {puzzles: PuzzleMaster.puzzles});
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
	if (req.puzzle.checkAnswer(req.user, req.body.answer)) {
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