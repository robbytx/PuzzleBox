var PuzzleMaster = require('../app/puzzlemaster'),
	dice = [4, 6, 8, 10, 12];

puzzle = {
	puzzid: "dicerace",
	name: "Dice Race",
	puzzleData: function(user) {
		return {num: dice[user.genNumber(this.puzzid, 5)]};
	},
	checkAnswer: function(user, answer) {
		var number = dice[user.genNumber(this.puzzid, 5)],
			probabilities = [];

		for (var i = 0; i < 20; i++) {
			probabilities.push((1 / number) * Math.pow(1 - (1 / number), (i * 2) + 1))
		}

		answer = parseFloat(answer);
		var sum = Math.floor(probabilities.reduce(function (a, b) {return a + b; } ) * 100000) / 1000;

		return answer === sum;
	}
}

PuzzleMaster.registerPuzzle(puzzle)
