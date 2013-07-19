var PuzzleMaster = require('../app/puzzlemaster');

var answers = {
  "HELLOWORLD":   "44580442473324",
  "FOOBARBAZ":    "1378097814236",
  "EXCELHEADERS": "21757164289966059"
};

var phrases = [];
for (var phrase in answers) {
  phrases.push(phrase);
}
phrases.sort();

puzzle = {
  puzzid: "excelheaders",
  name: "Excel Column Headers",

  getUserIndex: function(user) {
    return user.genNumber(this.puzzid, phrases.length);
  },

  puzzleData: function(user) {
    var id = this.getUserIndex(user);
    return {phrase: phrases[id]};
  },

  checkAnswer: function(user, guess) {
    var id = this.getUserIndex(user);
    return guess === answers[phrases[id]];
  }
};

PuzzleMaster.registerPuzzle(puzzle);
