const CartController = require('../controllers/CartController')
const fetchOrCreateCart = require('../middlewares/fetchOrCreateCart')
const passUserEmailToCart = require('../middlewares/passUserEmailToCart')

const router = require('express').Router()

router.get('/', passUserEmailToCart, fetchOrCreateCart, CartController.fetchCart)
router.put('/', passUserEmailToCart, fetchOrCreateCart, CartController.updateCart)

module.exports = router
