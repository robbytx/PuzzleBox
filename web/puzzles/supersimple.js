var PuzzleMaster = require('../app/puzzlemaster'),
	theAnswer = "cheeseburger";

puzzle = {
	puzzid: "supersimple",
	name: "Super Simple Puzzle",
	puzzleData: function(user) {
		return {answer: theAnswer};
	},
	checkAnswer: function(user, answer) {
		console.log(theAnswer, answer);
		return answer === theAnswer;
	}
}

PuzzleMaster.registerPuzzle(puzzle)
