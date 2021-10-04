const CartDAO = require('../dao/cartDAO')
const ObjectID = require('mongodb').ObjectID

module.exports = {
	fetchCart: async (req, res) => {
		const shoppingSessionId = res.locals.shoppingSessionId
		const cartData = await CartDAO.get(ObjectID(shoppingSessionId))
		if (cartData.success) {
			res.status(200).send(cartData.data)
		} else {
			res.sendStatus(404)
		}
	},
	updateCart: async (req, res) => {
		const addProductObject = {
			shoppingSessionId: res.locals.shoppingSessionId,
			cartUpdateObj: { products: req.body }
		}
		const addProductResult = await CartDAO.put(addProductObject)
		if (addProductResult.success) {
			res.sendStatus(201)
		} else {
			res.sendStatus(404)
		}
	}
}
