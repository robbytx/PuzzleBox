exports.renderIndex = function(req, res) {
	res.render('index', {add_name: req.user.name == "Anonymous"});
};