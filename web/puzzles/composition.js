var PuzzleMaster = require('../app/puzzlemaster'),
	theAnswer = "1731030945644";

puzzle = {
	puzzid: "composition",
	name: "Composition",
	puzzleData: function(user) {
		return {answer: theAnswer};
	},
	checkAnswer: function(user, answer) {
		return answer === theAnswer;
	}
}

PuzzleMaster.registerPuzzle(puzzle)
