const CartController = require('../controllers/CartController')
const fetchOrCreateCart = require('../middlewares/fetchOrCreateCart')
const passUserIdToCart = require('../middlewares/passUserIdToCart')

const router = require('express').Router()

router.get('/', passUserIdToCart, fetchOrCreateCart, CartController.fetchCart)
router.put('/', passUserIdToCart, fetchOrCreateCart, CartController.updateCart)

module.exports = router
