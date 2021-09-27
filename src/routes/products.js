const ProductsController = require('../controllers/ProductsController')
const router = require('express').Router()

router.get('/', ProductsController.getAllProducts)
router.post('/', ProductsController.addNewProduct)
router.get('/:id', ProductsController.getSingleProduct)
router.patch('/:id', ProductsController.updateExistingProduct)
router.get('/category/:category', ProductsController.getProductsInCategory)

module.exports = router