var mongoose = require('mongoose');

exports.requireLogin = function (req, res, next) {
	if (!req.session.user) {
		res.redirect("/");
		return;
	}
	next();
};
