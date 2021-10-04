let cart

module.exports = class CartDAO {
	static injectDB = async db => {
		if (cart) {
			return
		}
		try {
			cart = await db.collection('cart')
		} catch (err) {
			console.error(
				`Could not establish collection handle in cartDAO: ${err}`
			)
			return { error: err }
		}
	}

	static get = async shoppingSessionId => {
		try {
			const cartData = await cart.findOne({ _id: shoppingSessionId })
			if (cartData) {
				return { success: true, data: cartData }
			} else {
				return { success: false }
			}
		} catch (err) {
			console.error(`Unable to load cart data: ${err}`)
			return { error: err }
		}
	}

	static put = async ({ shoppingSessionId, cartUpdateObj }) => {
		try {
			const updatedCart = await cart.updateOne(
				{ _id: shoppingSessionId },
				{
					$set: cartUpdateObj
				},
				{ upsert: true }
			)

			if (updatedCart.modifiedCount === 1) {
				return { success: true }
			} else return { success: false }
		} catch (err) {
			console.error(`Unable to modify cart: ${err}`)
			return { error: err }
		}
	}



	static merge = async (userId) => {
		try {
			// TODO: merge products with any outstanding cart of user
		} catch (err) {
			console.error(`Unable to merge carts: ${err}`)
		}
	}
}