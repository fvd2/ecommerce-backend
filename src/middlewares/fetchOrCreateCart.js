const ObjectID = require('mongodb').ObjectID
const CartDAO = require('../dao/cartDAO')

module.exports = async (req, res, next) => {
	// check if there is an existing shopping session
	if (req.cookies.shopping_session_id) {
		res.locals.shoppingSessionId = req.cookies.shopping_session_id
		
		// if accessToken is used, add userId to cart 
		if (res.locals.userId) {
			await CartDAO.put({
				shoppingSessionId: res.locals.shoppingSessionId,
				cartUpdateObj: { userId: ObjectID(res.locals.userId) }
			})
			// TODO: merge products with any outstanding cart of user
		} 
	} else {
		res.locals.shoppingSessionId = new ObjectID()
		await CartDAO.put({
			shoppingSessionId: res.locals.shoppingSessionId,
			cartUpdateObj: { userId: ObjectID(res.locals.userId) }
		})
		res.cookie('shopping_session_id', res.locals.shoppingSessionId, {
			secure: process.env.NODE_ENV !== 'DEVELOPMENT',
			httpOnly: true,
			sameSite: true
		})
	}
	next()
}
