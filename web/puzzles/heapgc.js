var PuzzleMaster = require('../app/puzzlemaster');

var puzzles = [
  {"filename":"UEJC.json","directReferences":["CGB","DN","SM","OR","AGB"],"answer":704},
  {"filename":"BMUC.json","directReferences":["DJB","RLB","IAB","BJB","NHB"],"answer":384},
  {"filename":"EQMB.json","directReferences":["BZ","UEB","ZB","NDB","FCB"],"answer":404},
  {"filename":"MXXB.json","directReferences":["HKB","TFB","YEB","GKB","MJB"],"answer":508},
  {"filename":"YHCE.json","directReferences":["TFB","YEB","QEB","IK","VY"],"answer":316},
  {"filename":"FPNE.json","directReferences":["HI","TFB","NHB","BP","NKB"],"answer":608},
  {"filename":"JTFD.json","directReferences":["PHB","CL","OBB","VDB","ZFB"],"answer":680},
  {"filename":"QARD.json","directReferences":["GKB","RP","FJB","JP","EP"],"answer":384},
  {"filename":"YMD.json","directReferences":["WIB","WAB","QFB","JLB","SHB"],"answer":372},
  {"filename":"FUO.json","directReferences":["ZL","SZ","BJB","VN","KDB"],"answer":396},
  {"filename":"NWYE.json","directReferences":["YDB","TY","KMB","WHB","NJ"],"answer":424},
  {"filename":"UDKF.json","directReferences":["MIB","NJ","MW","SQ","QLB"],"answer":320},
  {"filename":"CQWB.json","directReferences":["DCB","RBB","JDB","GI","TIB"],"answer":624},
  {"filename":"KXHC.json","directReferences":["JS","WK","IZ","MP","XJB"],"answer":564},
  {"filename":"NBAB.json","directReferences":["LIB","SY","GKB","CKB","XQ"],"answer":500},
  {"filename":"VILB.json","directReferences":["OCB","JE","YCB","ODB","JN"],"answer":272},
  {"filename":"HQCB.json","directReferences":["TU","WS","EBB","QAB","ZFB"],"answer":364},
  {"filename":"OXNB.json","directReferences":["TFB","UT","YZ","CX","YU"],"answer":456},
  {"filename":"SBG.json","directReferences":["YU","IJ","UJB","DLB","CGB"],"answer":788},
  {"filename":"ZIR.json","directReferences":["DX","UV","SC","ACB","HB"],"answer":384},
  {"filename":"LTVC.json","directReferences":["JIB","VIB","QBB","WP","QGB"],"answer":504},
  {"filename":"SAHD.json","directReferences":["SZ","NLB","RLB","ZLB","KH"],"answer":488},
  {"filename":"WEZB.json","directReferences":["OP","JI","PGB","IBB","OO"],"answer":732},
  {"filename":"DMKC.json","directReferences":["IBB","JY","PU","NGB","LKB"],"answer":272},
  {"filename":"PWOE.json","directReferences":["NT","DGB","QDB","AT","HR"],"answer":304}
];

puzzle = {
  puzzid: "heapgc",
  name: "Heap Garbage Collection",

  getPuzzle: function(user) {
    return puzzles[user.genNumber(this.puzzid, puzzles.length)];
  },

  puzzleData: function(user) {
    var puzzle = this.getPuzzle(user);
    var refs = puzzle.directReferences;
    var refString = refs.slice(0, refs.length - 1).join(", ") + ", and " + refs[refs.length - 1];
    return {filename: puzzle.filename, directReferences: refString};
  },

  checkAnswer: function(user, guess) {
    var answer = this.getPuzzle(user).answer;
    return answer === guess;
  }
};

PuzzleMaster.registerPuzzle(puzzle);
