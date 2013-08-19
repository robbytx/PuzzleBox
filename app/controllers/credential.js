var mongoose = require('mongoose'),
	crypto = require('crypto'),
	AWS = require('aws-sdk'),
	ses = new AWS.SES(),
	User = mongoose.model('User');

exports.doLogin = function(req, res) {
	var split = req.query.token.split('|'),
		sign = split[0]
		email = (new Buffer(split[1], 'hex')).toString();

	if (sign == crypto.createHmac('sha1', process.env.HASH_SECRET).update(email).digest('hex')) {
		console.log(email + " logged in from email.");

		User.findOrAddByEmail(req.session.user)(function (user) {
			req.session.user = user.id;
			res.redirect('/');			
		});
	} else {
		console.log(email + " invalid login, unmatching sign.")
		res.redirect('/');
	}
};

exports.sendLogin = function(req, res) {
	var email = req.body.email,
		token = crypto.createHmac('sha1', process.env.HASH_SECRET).update(email).digest('hex') + "|" + (new Buffer(email)).toString('hex'),
		loginLink = process.env.HOST_PORT + "/login?token=" + token;

	var request = ses.sendEmail({
		Source: "puzzles@nexus.bazaarvoice.com",
		Destination: {
			ToAddresses: [email]
		},
		Message: {
			Subject: {
				Data: "Bazaarvoice PuzzleBox Login"
			},
			Body: {
				Text: {
					Data: "Hello! You, or someone claiming to be you, wants to log in to the Bazaarvoice Puzzlebox with this email address.\n" + 
						"Click the below link to log in. If this was not you, you can ignore this email.\n" +
						loginLink
				}
			}
		}

	});
	request.on('error', function(resp) {
	  console.log("Error sending email: " + resp); // log the successful data response
	});
	request.on('success', function(resp) {
	  console.log("Sent email " + resp.data); // log the successful data response
	});
	
	request.send();
	console.log("Sent email to " + email);

	res.render("emailsent");
}

exports.logout = function (req, res) {
	delete req.session.user;
	res.redirect('/');
};
