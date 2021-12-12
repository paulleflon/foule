const bcrypt = require('bcrypt');

module.exports = function(password) {
	return function(req, res, next) {
		console.log('password', req.query.password);
		if (!req.query.password || !bcrypt.compareSync(req.query.password, password))
			return res.status(401).send('Unauthorized');
		return next();
	};
};