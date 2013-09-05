var PuzzleMaster = require('../app/puzzlemaster'),
	theAnswer = "16796";

puzzle = {
	puzzid: "pointnav",
	name: "Navigation between Points",
	puzzleData: function(user) {
		return {answer: theAnswer};
	},
	checkAnswer: function(user, answer) {
		return answer === theAnswer;
	}
}

PuzzleMaster.registerPuzzle(puzzle)
