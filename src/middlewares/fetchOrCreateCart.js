const ObjectID = require('mongodb').ObjectID
const CartDAO = require('../dao/cartDAO')

module.exports = async (req, res, next) => {
	// check if there is an existing shopping session
	res.locals.shoppingSessionId = req.cookies.shopping_session_id
	if (req.cookies.shopping_session_id) {
		// delete any invalid remaining shopping session (it may have been deleted after order was paid)
		const doesSessionExist = await CartDAO.get(res.locals.shoppingSessionId)
		if (!doesSessionExist.success) {
			res.clearCookie('shopping_session_id')
			res.cookie(
				'shopping_session_id',
				res.locals.shoppingSessionId
			)
		}

		// if accessToken is used, add userId to cart
		if (res.locals.userId) {
			await CartDAO.put({
				shoppingSessionId: res.locals.shoppingSessionId,
				cartUpdateObj: {
					userId: ObjectID(res.locals.userId)
				}
			})
			// TODO: merge products with any outstanding cart of user
		}
	} else {
		res.locals.shoppingSessionId = new ObjectID()
		if (res.locals.userId) {
			await CartDAO.put({
				shoppingSessionId: res.locals.shoppingSessionId,
				cartUpdateObj: {
					userId: ObjectID(res.locals.userId),
					products: []
				}
			})
		} else {
			await CartDAO.put({
				shoppingSessionId: res.locals.shoppingSessionId,
				cartUpdateObj: {
					userId: ObjectID(res.locals.userId),
					products: []
				}
			})
		}
		res.cookie(
			'shopping_session_id',
			res.locals.shoppingSessionId,
			{
				secure: process.env.NODE_ENV !== 'DEVELOPMENT',
				httpOnly: true,
				sameSite: true
			}
		)
	}
	next()
}
