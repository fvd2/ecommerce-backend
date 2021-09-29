let cart
let orders

module.exports = class OrdersDAO {
	static injectDB = async db => {
		if (cart && orders) {
			return
		}
		try {
			cart = await db.collection('cart')
			orders = await db.collection('orders')
		} catch (err) {
			console.error(
				`Could not establish collection handle in ordersDAO: ${err}`
			)
			return { error: err }
		}
	}

	// create new order
	static post = async (userEmail) => {
		// aggregation pipeline to combine cart (product ID and quantity),
		// product details, and user info

		// outputs:
		// 1) line for each product
		// 2) total amount
		try {
			const pipeline = [
                {
                    $match: { userEmail }
                },
				{
					$lookup: {
						from: 'users',
						localField: 'userEmail',
						foreignField: 'email',
						as: 'customer'
					}
				},
				// {
				// 	$lookup: {
				// 		from: 'products',
				// 		localField: 'productId',
				// 		foreignField: 'id',
				// 		as: 'products'
				// 	}
				// },
				// { $out: 'orders' }
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
