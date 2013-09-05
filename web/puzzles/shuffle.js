var PuzzleMaster = require('../app/puzzlemaster');

var ranks = ["A", "K", "Q", "J"];
for (var i = 10; i > 1; i--) {
  ranks[14 - i] = String(i);
}

var cardNames = {
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  "J": "Jack",
  "Q": "Queen",
  "K": "King",
  "A": "Ace"
};

var suits = [
  'Spades',
  'Hearts',
  'Diamonds',
  'Clubs'
];

var suitSymbols = {
  'Spades': '\u2660',
  'Hearts': '\u2665',
  'Diamonds': '\u2666',
  'Clubs': '\u2663'
};

function getCardName(index, full) {
  var suitIndex = Math.floor(index / 13);
  var rankIndex = index % 13;

  var suit = suits[suitIndex];
  var suitSymbol = suitSymbols[suit];

  var rank = ranks[rankIndex];
  var cardName = cardNames[rank];

  return full ?
    rank + " " + suitSymbol + " (" + cardName + " of " + suit + ")" :
    rank + " " + suitSymbol;
}

var answers = [
  1.9230769230769194, // never returned, since this probability has no bias
  2.6004349090051746,
  2.5641638575713994,
  2.5285903263575027,
  2.4937009015131073,
  2.459482427146492,
  2.4259220003638435,
  2.3930069664039464,
  2.360724913866344,
  2.3290636700313945,
  2.298011296270201,
  2.2675560835428663,
  2.237686547983367,
  2.208391426569244,
  2.179659672874626,
  2.1514804529048996,
  2.1238431410115153,
  2.09673731588531,
  2.0701527566269187,
  2.0440794388927266,
  2.0185075311149676,
  1.9934273907944653,
  1.968829560864744,
  1.9447047661259795,
  1.9210439097475756,
  1.8978380698379889,
  1.8750784960805056,
  1.852756606433745,
  1.8308639838955778,
  1.8093923733292951,
  1.788333678350829,
  1.767679958275788,
  1.747423425125275,
  1.7275564406891912,
  1.708071513646112,
  1.6889612967384713,
  1.6702185840021362,
  1.651836308049189,
  1.6338075374030328,
  1.616125473884686,
  1.5987834500493834,
  1.5817749266724503,
  1.5650934902835372,
  1.5487328507482567,
  1.532686838896348,
  1.5169494041954361,
  1.5015146124695422,
  1.4863766436614543,
  1.4715297896381374,
  1.4569684520383457,
  1.4426871401616268,
  1.4286804688979216
];

puzzle = {
  puzzid: "shuffle",
  name: "Unfair Shuffle",

  getUserIndex: function(user) {
    // skip the first card (the Two of Clubs)
    return 1 + user.genNumber(this.puzzid, answers.length - 1);
  },

  puzzleData: function(user) {
    var index = this.getUserIndex(user);

    var cardsBySuit = [];
    for (var suit = 0; suit < suits.length; suit++) {
      cardsBySuit[suit] = [];
      for (var card = suit * ranks.length; card < (suit+1) * ranks.length; card++) {
        cardsBySuit[suit].push(card);
      }
    }

    return {
      yourCardName: getCardName(index, true),
      cardsBySuit: cardsBySuit,
      getCardName: getCardName,
      getSuitName: function (suit) {
        return suits[suit];
      }
    };
  },

  checkAnswer: function(user, guess) {
    var index = this.getUserIndex(user);
    var answer = answers[index];
    var guessFloat = parseFloat(guess);
    if (guessFloat < 1) {
      // no answers are below 1.0%, so assume they gave a raw probability
      guessFloat *= 100.0;
    }
    return Math.abs(answer - guessFloat) < 0.001;
  }
};

PuzzleMaster.registerPuzzle(puzzle);
