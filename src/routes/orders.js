const OrdersController = require('../controllers/OrdersController')
const fetchOrCreateCart = require('../middlewares/fetchOrCreateCart')
const passUserIdToCart = require('../middlewares/passUserIdToCart')
// const express = require('express')

const router = require('express').Router()

router.post(
	'/',
	passUserIdToCart,
	fetchOrCreateCart,
	OrdersController.createOrder
)
router.patch('/:id', OrdersController.updateOrderDetails)
router.get('/:id', OrdersController.getOrderStatus)
router.post(
	'/:id/pay',
	passUserIdToCart,
	fetchOrCreateCart,
	OrdersController.initiatePaymentProcess
)
router.post('/webhook', OrdersController.updateOrderStatus)

module.exports = router
