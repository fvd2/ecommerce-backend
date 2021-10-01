const { createMollieClient } = require('@mollie/api-client')
const OrdersDAO = require('../dao/ordersDAO')
const ObjectID = require('mongodb').ObjectID
const mollieClient = createMollieClient({
	apiKey: process.env.MOLLIE_TEST_API_KEY
})

module.exports = {
	getOrderStatus: async (req, res) => {
		const orderId = req.params.id
		const order = await OrdersDAO.get(orderId)
		if (order.success) {
			res.status(200).send(order.data)
		} else {
			res.sendStatus(404)
		}
	},
	createOrder: async (req, res) => {
		await OrdersDAO.post(res.locals.shoppingSessionId)
		res.status(201).send({ message: 'Successfully created order' })
	},
	initiatePaymentProcess: async (req, res) => {
		const mollieClient = createMollieClient({
			apiKey: process.env.MOLLIE_TEST_API_KEY
		})
		const retrievedOrder = await OrdersDAO.get(req.params.id)
		const productLines = retrievedOrder.products.map(product => {
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
				value: retrievedOrder.totalAmount.toFixed(2).toString()
			},
			orderNumber: res.locals.shoppingSessionId,
			lines: productLines,
			billingAddress: retrievedOrder.user.billingAddress,
			shippingAddress: retrievedOrder.user.shippingAddress,
			redirectUrl: `https://freekvandam.nl/ecom/orders/${req.params.id}/`,
			webhookUrl: 'https://027a-82-174-148-183.ngrok.io/orders/webhook',
			locale: 'en_US', // default to en_US
			method: ['ideal', 'paypal', 'creditcard']
		}
		try {
			const createdOrder = await mollieClient.orders.create(
				mollieOrderObject
			)
			await OrdersDAO.update(
				{ cartId: res.locals.shoppingSessionId },
				{
					mollieOrderId: createdOrder.id,
					status: createdOrder.status
				}
			)
			res.status(201).send({
				success: true,
				checkoutUrl: createdOrder._links.checkout.href
			})
		} catch (err) {
			console.error(`Failed to initiate mollie payment process: ${err}`)
		}
	},

	updateOrderStatus: async (req, res) => {
		// webhook that receives orderId of updated mollie order, and then updates the status locally
		const orderId = req.body.orderId
		try {
			const { status } = await mollieClient.orders.get(orderId)
			await OrdersDAO.update({ mollieOrderId: orderId }, { status })
			res.status(200).send({
				message: `Updated order status to ${status}`,
				orderStatus: status
			})
		} catch (err) {
			console.error(`Unable to update order status: ${err}`)
		}
	}
}
