exports.showProfile = function (req, res) {
	res.render('profile');
}

exports.submitProfile = function (req, res) {
	req.user.name = req.body.name;
	req.user.pSave()(function() {
		res.render('profile');	
	}).end();
}