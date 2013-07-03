require("fs").readdirSync("./puzzles").forEach(function(file) {
	if (file != "index.js") {
  		require("./" + file);
  	}
});
