var mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.showLeaderboard = function (req, res) {
	
	User.pFind({})(function(data) {
		var users = [];

		for (var i in data) {
			var user = data[i];
			if (user.completions.length > 0 && user.name != "Anonymous") {
				users.push({
					name: user.name,
					score: user.completions.length,
				});
			}	
		}
		res.render('leaderboard', {users: users});	
	}).end()

	
}