const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) {
		res.locals.userId = null
	} else {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				res.locals.userId = null
			} else {
				res.locals.userId = user.userId
			}
		})
	}
	next()
}
