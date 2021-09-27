const ProductsDAO = require('../dao/productsDAO')
const { v4: uuidv4 } = require('uuid')

module.exports = {
	getAllProducts: async (req, res) => {
		const allProducts = await ProductsDAO.get({
			type: 'all', // alternative values: category, single
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
			id: uuidv4(),
			title: req.body.title,
			description: req.body.description,
			category: req.body.category,
			image: req.body.image,
			rating: req.body.rating,
			votes: req.body.votes
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
	getSingleProduct: async (req, res) => {
		const singleProduct = await ProductsDAO.get({
			type: 'single', // alternative values: category, single
			productId: req.params.id,
			productTitle: null,
			category: null,
			limit: +req.query.limit || 0
		})
        console.log(req)
		if (singleProduct.success) {
			res.status(200).send(singleProduct.data)
		} else {
			res.status(404).send(singleProduct)
		}
	},
	updateExistingProduct: async (req, res) => {
		// TODO: limit to users with administrator rights (implement user scopes)
		const updates = req.body
		const updatedProduct = await ProductsDAO.patch(
			req.params.id,
			updates
		)
        if (updatedProduct.success) {
            res.status(200).send(updatedProduct.data)
        }
        else {
            res.status(404).send({...updatedProduct, error: 'Could not update product details; did you enter any modifications?'})
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
