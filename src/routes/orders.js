const OrdersController = require('../controllers/OrdersController')

const router = require('express').Router()

router.post('/', OrdersController.createOrder)
router.get('/:id', OrdersController.getOrderStatus)

module.exports = router