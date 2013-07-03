var PuzzleMaster = {
	puzzles: {},
	registerPuzzle: function(puzzle) {
		this.puzzles[puzzle.puzzid] = puzzle
	},
	getPuzzle: function(puzzid) {
		return this.puzzles[puzzid]
	}
	
}

module.exports = PuzzleMaster