const ObjectID = require('mongodb').ObjectID
const CartDAO = require('../dao/cartDAO')

module.exports = async (req, res, next) => {
	// check if there is an existing shopping session
	res.locals.shoppingSessionId = req.cookies.shopping_session_id
	if (req.cookies.shopping_session_id) {
		// delete any invalid remaining shopping session (i.e. when payment has been initiated)
		const doesSessionExist = await CartDAO.get(
			ObjectID(res.locals.shoppingSessionId)
		)
		if (!doesSessionExist.success) {
			res.clearCookie('shopping_session_id')
			const newSession = new ObjectID()
			await CartDAO.put({
				shoppingSessionId: newSession,
				cartUpdateObj: {
					products: []
				}
			})
			res.cookie('shopping_session_id', newSession.toHexString(), {
				secure: process.env.NODE_ENV !== 'DEVELOPMENT',
				httpOnly: true,
				sameSite: true
			})
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
					products: []
				}
			})
		}
		res.cookie(
			'shopping_session_id',
			res.locals.shoppingSessionId.toHexString(),
			{
				secure: process.env.NODE_ENV !== 'DEVELOPMENT',
				httpOnly: true,
				sameSite: true
			}
		)
	}
	next()
}
