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

	static set = async (shoppingSessionId, email) => {
		try {
			const newCart = await cart.insertOne({
				id: shoppingSessionId,
				date: Date.now(),
				userEmail: email,
				products: {}
			})
			if (newCart.insertedCount === 1) {
				return { success: true }
			} else return { success: false }
		} catch (err) {
			console.error(`Unable to create new cart: ${err}`)
			return { error: err }
		}
	}

	static get = async shoppingSessionId => {
		try {
			const cartData = await cart.findOne({ id: shoppingSessionId })
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

	static put = async ({ shoppingSessionId, updatedProducts }) => {
		try {
			console.log(updatedProducts)
			const updatedCart = await cart.updateOne(
				{ id: shoppingSessionId },
				{
					$set: {
						products: updatedProducts
					}
				}
			)
			if (updatedCart.modifiedCount === 1) {
				return { success: true }
			} else return { success: false }
		} catch (err) {
			console.error(`Unable to add product to cart: ${err}`)
			return { error: err }
		}
	}
}
