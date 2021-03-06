const ObjectID = require('mongodb').ObjectID

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
		}
	}

	// create new order
	static post = async ({ userId, shoppingSessionId }) => {
		// aggregation pipeline to combine cart (product ID and quantity),
		// product details, and user info
		try {
			const orderId = new ObjectID()

			// pipeline stages (separated to conditionally manage logged in user data)
			const findCartAndMergeProductsStage = [
				// find shopping session
				{
					$match: { _id: ObjectID(shoppingSessionId) }
				},

				// flatten products array
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
							},
							{
								$addFields: {
									vatAmount: {
										$subtract: [
											'$totalAmount',
											{
												$divide: [
													'$totalAmount',
													{ $add: [1, '$vatRate'] }
												]
											}
										]
									}
								}
							}
						],
						as: 'products'
					}
				},
				// calculate total amount for the order
				{ $unwind: '$products' }
			]

			const handleUserStage = () => {
				if (userId) {
					return [
						// add relevant user data from users collection
						{
							$lookup: {
								from: 'users',
								localField: 'userId',
								foreignField: '_id',
								as: 'user'
							}
						},
						{ $unwind: '$user' }
					]
				} else {
					return [{ $addFields: { user: null } }]
				}
			}
			const createOrderDocumentStage = [
				{
					$group: {
						_id: orderId,
						cartId: { $first: '$_id' },
						user: { $first: '$user' },
						products: { $addToSet: '$products' },
						totalAmount: { $sum: '$products.totalAmount' }
					}
				},
				{
					$addFields: {
						status: 'saved' // initial status, which is later overwritten by mollie order status
					}
				},
				{
					$merge: {
						into: 'orders',
						on: '_id',
						whenMatched: 'replace',
						whenNotMatched: 'insert'
					}
				}
			]

			const pipeline = [
				...findCartAndMergeProductsStage,
				...handleUserStage(),
				...createOrderDocumentStage
			]
			await cart.aggregate(pipeline).toArray()
			return orderId
		} catch (err) {
			console.error(
				`Could not execute order aggregation pipeline: ${err}`
			)
			return { success: false, error: err }
		}
	}

	static get = async filterObj => {
		try {
			const fetchedOrder = await orders.findOne(filterObj)
			return { success: true, data: fetchedOrder }
		} catch (err) {
			console.error(`Could not find order: ${err}`)
			return { success: false, error: err }
		}
	}

	// update after webhook call
	static update = async (filterObj, updateObj) => {
		try {
			const updateResult = await orders.updateOne(filterObj, {
				$set: updateObj
			})
			if (updateObj.status !== 'saved') {
				const { cartId } = await orders.findOne(filterObj)
				await cart.deleteOne({ _id: ObjectID(cartId) })
			}
			if (updateResult.modifiedCount === 1) {
				return { success: true }
			} else return { success: false }
		} catch (err) {
			console.error(`Unable to update order: ${err}`)
			return { success: false, error: err }
		}
	}
}
