var mongoose = require('mongoose');

exports.requireLogin = function (req, res, next) {
	if (!req.user) {
		res.redirect("/");
		return;
	}
	next();
};
