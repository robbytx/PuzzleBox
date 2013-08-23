require("fs").readdirSync("./puzzles").forEach(function(file) {
	if (file != "index.js" && file[0] != "_") {
  		require("./" + file);
  	}
});
