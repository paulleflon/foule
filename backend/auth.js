module.exports = function(req, res, next) {
	const auth = req.headers.authorization || req.query.authorization; 
	if (process.env.API_KEY === undefined)
		return next();
	if (auth === undefined || auth !== process.env.API_KEY)
		return res.status(401).send('Unauthorized');
	next();
};