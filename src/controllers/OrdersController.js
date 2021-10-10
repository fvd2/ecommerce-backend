const { createMollieClient } = require('@mollie/api-client')
const OrdersDAO = require('../dao/ordersDAO')
const ObjectID = require('mongodb').ObjectID
const mollieClient = createMollieClient({
	apiKey: process.env.MOLLIE_TEST_API_KEY
})

module.exports = {
	getOrderStatus: async (req, res) => {
		const orderId = req.params.id
		const order = await OrdersDAO.get({ _id: ObjectID(orderId) })
		if (order.success) {
			res.status(200).send(order.data)
		} else {
			res.sendStatus(404)
		}
	},
	createOrder: async (req, res) => {
		const shoppingSessionId = res.locals.shoppingSessionId
		const order = await OrdersDAO.get({
			cartId: ObjectID(shoppingSessionId)
		})
		if (order.data) {
			res.status(409).send({
				message:
					'There is already an order associated with this cart id',
				orderId: order.data._id,
				status: order.data.status
			})
		} else {
			const result = await OrdersDAO.post(res.locals)
			if (result.success) {
				res.status(201).send({
					message: 'Successfully created order',
					orderId: result.orderId,
					status: 'saved'
				})
			} else {
				res.status(404)
			}
		}
	},
	initiatePaymentProcess: async (req, res) => {
		const mollieClient = createMollieClient({
			apiKey: process.env.MOLLIE_TEST_API_KEY
		})
		const { data } = await OrdersDAO.get(ObjectID(req.params.id))
		const productLines = await data.products.map(product => {
			return {
				name: product.title,
				quantity: product.productQuantity,
				unitPrice: {
					currency: 'EUR',
					value: product.price.toFixed(2).toString()
				},
				totalAmount: {
					currency: 'EUR',
					value: product.totalAmount.toFixed(2).toString()
				},
				vatRate: product.vatRate * 100,
				vatAmount: {
					currency: 'EUR',
					value: product.vatAmount.toFixed(2).toString()
				},
				discountAmount: {
					currency: 'EUR',
					value: product.discountAmount.toFixed(2).toString()
				}
			}
		})

		const mollieOrderObject = {
			amount: {
				currency: 'EUR',
				value: data.totalAmount.toFixed(2).toString()
			},
			orderNumber: data.cartId,
			lines: productLines,
			billingAddress: data.user.billingAddress,
			shippingAddress: data.user.shippingAddress,
			redirectUrl: `https://freekvandam.nl/ecom/order/${req.params.id}/`,
			webhookUrl: 'http://freekvandam.nl/ecom/api/orders/webhook',
			locale: 'en_US', // default to en_US
			method: ['ideal', 'paypal', 'creditcard']
		}
		try {
			const createdOrder = await mollieClient.orders.create(
				mollieOrderObject
			)
			await OrdersDAO.update(
				{ cartId: ObjectID(res.locals.shoppingSessionId) },
				{
					mollieOrderId: createdOrder.id,
					status: createdOrder.status
				}
			)
			if (createdOrder.status === 'paid') {
				res.clearCookie('shopping_session_id')
				res.status(201).send({
					success: true,
					checkoutUrl: createdOrder._links.checkout.href
				})
			} else {
				res.status(201).send({
					success: true,
					checkoutUrl: createdOrder._links.checkout.href
				})
			}
		} catch (err) {
			console.error(`Failed to initiate mollie payment process: ${err}`)
		}
	},

	// update order (e.g. user address) details after checkout form is filled

	updateOrderDetails: async (req, res) => {
		const { id, ...updatedOrderDetails } = req.body
		try {
			const updateResult = await OrdersDAO.update(
				{ _id: ObjectID(id) },
				{ user: updatedOrderDetails }
			)
			if (updateResult.success) {
				res.status(200).send({
					success: true,
					message: 'Updated order details'
				})
			}
		} catch (err) {
			console.error(`Unable to update order details: ${err}`)
		}
	},

	updateOrderStatus: async (req, res) => {
		// webhook that receives orderId of updated mollie order, and then updates the status locally
		const orderId = req.body.id
		try {
			const { status } = await mollieClient.orders.get(orderId)
			await OrdersDAO.update({ mollieOrderId: orderId }, { status })
			res.status(200).send({
				message: `Updated order status to ${status}`,
				status
			})
		} catch (err) {
			console.error(`Unable to update order status: ${err}`)
		}
	}
}
