const { createMollieClient } = require('@mollie/api-client')
const OrdersDAO = require('../dao/ordersDAO')
const ObjectID = require('mongodb').ObjectID
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_TEST_API_KEY })

module.exports = {
	getOrderStatus: () => {},
	createOrder: async (req, res) => {
		const createdOrder = await OrdersDAO.post(res.locals.shoppingSessionId)
		res.status(201).send({ message: 'Successfully created order' })
	},
	initiatePaymentProcess: async (req, res) => {

        console.log(req.params.id)
        const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_TEST_API_KEY })
		const retrievedOrder = await OrdersDAO.get(req.params.id)
		const productLines = retrievedOrder.products
			.map(product => {
				return {
					name: product.title,
					quantity: product.productQuantity,
					unitPrice: {currency: 'EUR', value: product.price.toFixed(2).toString()},
					totalAmount: {currency: 'EUR', value: product.totalAmount.toFixed(2).toString()},
					vatRate: product.vatRate*100,
					vatAmount: {currency: 'EUR', value: product.vatAmount.toFixed(2).toString()},
					discountAmount: {currency: 'EUR', value: product.discountAmount.toFixed(2).toString()}
				}
			})

		const mollieOrderObject = {
		    amount: {
		        currency: 'EUR',
		        value: retrievedOrder.totalAmount.toFixed(2).toString()
		    },
		    orderNumber: new ObjectID(),
		    lines: productLines,
		    billingAddress: retrievedOrder.user.billingAddress,
		    shippingAddress: retrievedOrder.user.shippingAddress,
		    redirectUrl: `https://freekvandam.nl/orders/${req.params.id}/`,
		    webhookUrl: 'http://20dd-82-174-148-183.ngrok.io/orders/webhook',
		    locale: 'en_US', // default to en_US
		    method: ['ideal', 'paypal', 'creditcard']
		}
        try {
            const createOrder = await mollieClient.orders.create(mollieOrderObject)
            console.log(createOrder)
        } catch(err) {
            console.error(`Failed to initiate mollie payment process: ${err}`)
        }
    },

	updateOrderStatus: async (req, res) => {
		// TODO: build webhook that checks payment status and updates it if necessary
		const orderId = req.body.orderId
		// check payment status
        try {
            const findOrder = await mollieClient.orders.get(orderId)
            console.log(findOrder)
            res.status(200)
        } catch(err) {
            console.error(`Unable to get mollie order: ${err}`)
        }

		// update payment status
		// OrdersDAO.update(orderId)
	}
}
