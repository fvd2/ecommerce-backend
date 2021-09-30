const OrdersController = require('../controllers/OrdersController')
const fetchOrCreateCart = require('../middlewares/fetchOrCreateCart')

const router = require('express').Router()

router.post('/', fetchOrCreateCart, OrdersController.createOrder)
router.get('/:id', fetchOrCreateCart, OrdersController.getOrderStatus)
router.post('/webhook', OrdersController.updateOrderStatus)

module.exports = router
