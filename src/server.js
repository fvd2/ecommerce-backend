const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const users = require('./routes/users')
const auth = require('./routes/auth')
const products = require('./routes/products')
const cart = require('./routes/cart')
const orders = require('./routes/orders')

const app = express()
app.use([express.json(), cookieParser(), cors({origin: 'http://localhost:3000', credentials: true})])
app.use('/users', users)
app.use('/auth', auth)
app.use('/products', products)
app.use('/cart', cart)
app.use('/orders', orders)

module.exports = app