var PuzzleMaster = {
	puzzles: {},
	registerPuzzle: function(puzzle) {
		this.puzzles[puzzle.puzzid] = puzzle
	},
	getPuzzle: function(puzzid) {
		return this.puzzles[puzzid]
	},
	checkAnswer: function(puzzle, user, answer) {
		if (puzzle.checkAnswer(user, answer)) {
			user.completePuzzle(puzzle.puzzid);
			user.save();
			return true;
		}
		return false;
	}
	
}

module.exports = PuzzleMaster