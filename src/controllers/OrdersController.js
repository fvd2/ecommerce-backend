const { createMollieClient } = require('@mollie/api-client')
const OrdersDAO = require('../dao/ordersDAO')
const { v4: uuidv4 } = require('uuid')
const res = require('express/lib/response')

module.exports = {
    getOrderStatus: () => {},
    createOrder: async (req, res) => {
        const createdOrder = await OrdersDAO.post('freekvandam@gmail.com')
        res.status(200).send(createdOrder)

        // const orderId = uuidv4()
        // const orderObject = {
        //     amount: {
        //         currency: 'EUR',
        //         value // total amount
        //     },
        //     orderNumber, // accepts string, should be id
        //     lines: {
        //         category: // source: product category 
        //         name:  // source: product name

        //     },
        //     billingAddress: {
        //         streetAndNumber,
        //         streetAdditional,
        //         postalCode,
        //         city,
        //         country // only accept NL
        //     },
        //     shippingAddress, // source: user or form - default: same as billingAddress
        //     redirectUrl, // should be /order/:id
        //     webhookUrl,
        //     locale, // default to en_US
        //     method, // payment method, default to: [ideal, paypal, creditcard]

        // } 

        // // create order within web application

        // // create order for payment processor
        // const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_TEST_API_KEY })

        // // TODO: change to create order and populate object
        // const createPayment = async () => {
        //     const payment = await mollieClient.payments.create({
        //         amount: {
        //             currency: 'EUR',
        //             value: '10.00'
        //         },
        //         method: 'ideal',
        //         description: 'test',
        //         redirectUrl: 'https://freekvandam.nl/shop/bla/',
        //         webhookUrl: 'https://freekvandam.nl/payments/webhook/'
        //     })
        // }
    }
}

