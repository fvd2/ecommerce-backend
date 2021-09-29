const { v4: uuidv4 } = require('uuid')
const CartDAO = require('../dao/cartDAO')

module.exports = async (req, res, next) => {
	// check if there is an existing shopping session
	let shoppingSessionId = req.cookies.shopping_session_id
	if (shoppingSessionId) {
		res.locals.shoppingSessionId = shoppingSessionId
		next()
	} else {
		res.locals.shoppingSessionId = uuidv4()
		await CartDAO.set(res.locals.shoppingSessionId, res.locals.email)
		res.cookie('shopping_session_id', res.locals.shoppingSessionId, {
			secure: process.env.NODE_ENV !== 'DEVELOPMENT',
			httpOnly: true,
			sameSite: true
		})
		next()
	}
}
