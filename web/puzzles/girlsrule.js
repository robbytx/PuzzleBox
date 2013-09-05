var PuzzleMaster = require('../app/puzzlemaster');

puzzle = {
	puzzid: "girlsrule",
	name: "Girls Rule",
  getPercentage: function(user) {
    // Some number between 0 and 10
    return 45 + user.genNumber(this.puzzid, 11);
  },

	puzzleData: function(user) {
    var percentage = this.getPercentage(user);
    return {percentage: percentage, probability: percentage/100.0};
	},
	checkAnswer: function(user, guess) {
    var answer = 100 - this.getPercentage(user);
    var guessFloat = parseFloat(guess);
    if (guessFloat < 1) {
      // no answers are below 1.0%, so assume they gave a raw probability
      guessFloat *= 100.0;
    }
    return Math.abs(answer - guessFloat) < 0.001;
	}
}

PuzzleMaster.registerPuzzle(puzzle)
