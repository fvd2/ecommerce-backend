const ProductsDAO = require('../dao/productsDAO')
const ObjectID = require('mongodb').ObjectID

module.exports = {
	getAllProducts: async (req, res) => {
		const allProducts = await ProductsDAO.get({
			type: 'all', // alternative values: category, single, cart
			productId: null,
			productTitle: null,
			category: null,
			limit: +req.query.limit || 0
		})

		if (allProducts.success) {
			res.status(200).send(allProducts.data)
		} else {
			res.status(404).send(allProducts)
		}
	},
	addNewProduct: async (req, res) => {
		// TODO: limit to users with administrator rights (implement user scopes)
		const newProduct = {
			_id: new ObjectID(),
			...req.body
		}
		// check for duplicate title
		const titleSearch = await ProductsDAO.get({
			type: 'single', // alternative values: category, single
			productId: null,
			productTitle: req.body.title,
			category: null,
			limit: +req.query.limit || 0
		})
		if (titleSearch.success) {
			res.status(409).send({ error: 'Product title already exists' })
		} else {
			const postProduct = await ProductsDAO.post(newProduct)
			if (postProduct.success) {
				res.sendStatus(201)
			} else {
				res.sendStatus(404)
			}
		}
	},
	getCartProducts: async (req, res) => {
		const cartProducts = await ProductsDAO.get({
			type: 'cart',
			productId: req.body.productsInCart.map(id => ObjectID(id)),
			productTitle: null,
			category: null,
			limit: 0
		})
		if (cartProducts.success) {
			res.status(200).send(cartProducts.data)
		} else {
			res.sendStatus(404)
		}
	},
	getSelectedProduct: async (req, res) => {
		const selectedProduct = await ProductsDAO.get({
			type: 'single', // alternative values: category, single
			productId: ObjectID(req.params.id),
			productTitle: null,
			category: null,
			limit: +req.query.limit || 0
		})
		if (selectedProduct.success) {
			res.status(200).send(selectedProduct.data)
		} else {
			res.status(404).send(selectedProduct)
		}
	},
	updateExistingProduct: async (req, res) => {
		// TODO: limit to users with administrator rights (implement user scopes)
		const updates = req.body
		const updatedProduct = await ProductsDAO.patch(
			ObjectID(req.params.id),
			updates
		)
		if (updatedProduct.success) {
			res.status(200).send(updatedProduct.data)
		} else {
			res.status(404).send({
				...updatedProduct,
				error: 'Could not update product details; did you enter any modifications?'
			})
		}
	},
	getProductsInCategory: async (req, res) => {
		const categoryProducts = await ProductsDAO.get({
			type: 'category', // alternative values: category, single
			productId: null,
			productTitle: null,
			category: req.params.category,
			limit: +req.query.limit || 0
		})
		if (categoryProducts.success) {
			res.status(200).send(categoryProducts.data)
		} else {
			res.status(404).send(categoryProducts)
		}
	}
}
