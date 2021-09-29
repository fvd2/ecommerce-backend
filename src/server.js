const express = require('express')
const cookieParser = require('cookie-parser')
const users = require('./routes/users')
const auth = require('./routes/auth')
const products = require('./routes/products')
const cart = require('./routes/cart')

const app = express()
app.use([express.json(), cookieParser()])
app.use('/users', users)
app.use('/auth', auth)
app.use('/products', products)
app.use('/cart', cart)

module.exports = app