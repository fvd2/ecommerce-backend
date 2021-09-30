let cart
let orders
let products

module.exports = class OrdersDAO {
	static injectDB = async db => {
		if (cart && orders && products) {
			return
		}
		try {
			cart = await db.collection('cart')
			orders = await db.collection('orders')
			products = await db.collection('orders')
		} catch (err) {
			console.error(
				`Could not establish collection handle in ordersDAO: ${err}`
			)
			return { error: err }
		}
	}

	// create new order
	static post = async shoppingSessionId => {
		// aggregation pipeline to combine cart (product ID and quantity),
		// product details, and user info

		try {
			const pipeline = [
				// find shopping session
				{
					$match: { _id: shoppingSessionId }
				},

				// add relevant user data from users collection
				{
					$lookup: {
						from: 'users',
						localField: 'userId',
						foreignField: '_id',
						as: 'user'
					}
				},
				// flatten user and products arrays
				{ $unwind: '$user' },
				{ $unwind: '$products' },

				// add product data for each product in user cart and calculate product total amount
				{
					$lookup: {
						from: 'products',
						let: {
							productId: { $toObjectId: '$products.productId' },
							products: '$products'
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$eq: ['$_id', '$$productId']
									}
								}
							},
							{
								$replaceRoot: {
									newRoot: {
										$mergeObjects: ['$$products', '$$ROOT']
									}
								}
							},
							{
								$addFields: {
									totalAmount: {
										$multiply: [
											'$productQuantity',
											'$price'
										]
									}
								}
							}
						],
						as: 'products'
					}
				},
				// calculate total amount for the order
				{ $unwind: '$products' },
				{
					$group: {
						_id: '$_id',
						user: { $first: '$user' },
						products: { $addToSet: '$products' },
						totalAmount: { $sum: '$products.totalAmount' }
					}
				}
			]
			const aggregatedOrder = await cart.aggregate(pipeline).toArray()
			return aggregatedOrder
		} catch (err) {
			console.error(
				`Could not execute order aggregation pipeline: ${err}`
			)
		}
	}

	static get = () => {}

	// update after webhook call
	static update = () => {}
}
