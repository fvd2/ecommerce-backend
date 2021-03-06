const ProductsController = require('../controllers/ProductsController')
const router = require('express').Router()

router.get('/', ProductsController.getAllProducts)
router.post('/', ProductsController.addNewProduct)
router.get('/category/:category', ProductsController.getProductsInCategory)
router.post('/cart', ProductsController.getCartProducts)
router.get('/:id', ProductsController.getSelectedProduct)
router.patch('/:id', ProductsController.updateExistingProduct)

module.exports = router