let products

module.exports = class ProductsDAO {
	static injectDB = async db => {
		if (products) {
			return
		}
		try {
			products = await db.collection('products')
		} catch (err) {
			console.error(
				`Could not establish collection handle in productDAO: ${err}`
			)
			return { error: err }
		}
	}

	static get = async ({ type, productId, productTitle, category, limit }) => {
		let foundProducts
		try {
			if (type === 'all') {
				foundProducts = await products.find({}).limit(limit).toArray()
				return { success: true, data: foundProducts }
			}
			if (type === 'cart') {
				foundProducts = await products
					.find({ _id: { $in: productId } })
					.limit(limit)
					.toArray()
				return { success: true, data: foundProducts }
			}
			if (type === 'category') {
				foundProducts = await products
					.find({ category })
					.limit(limit)
					.toArray()
				return { success: true, data: foundProducts }
			}
			if (type === 'single') {
				if (productId) {
					foundProducts = await products.findOne({ _id: productId })
				}
				if (productTitle) {
					foundProducts = await products.findOne({
						title: productTitle
					})
				}
				if (foundProducts) {
					return { success: true, data: foundProducts }
				} else return { success: false }
			}
		} catch (err) {
			console.error(`Unable to find products: ${err}`)
			return { success: false, error: err }
		}
	}

	static post = async (type, productObj) => {
		let postResult
		try {
			if (type === 'many') {
				postResult = await products.insertMany(productObj)
			}
			else {
				postResult = await products.insertOne(productObj)
			}
			if (postResult.insertedCount >= 1) {
				return { success: true }
			}
		} catch (err) {
			console.error(`Unable to insert new product: ${err}`)
			return { success: false, error: err }
		}
	}

	static patch = async (id, updates) => {
		try {
			const patchResult = await products.updateOne(
				{ _id: id },
				{ $set: { ...updates } }
			)
			if (
				patchResult.matchedCount === 1 &&
				patchResult.modifiedCount === 1
			) {
				return { success: true }
			} else {
				return { success: false }
			}
		} catch (err) {
			console.error(`Unable to update existing product: ${err}`)
			return { success: false, error: err }
		}
	}
}
