const { MongoClient } = require('mongodb')
const app = require('./server')
const usersDAO = require('./dao/usersDAO')
const authDAO = require("./dao/authDAO")
const productsDAO = require("./dao/productsDAO")

const PORT = process.env.PORT || 5000

MongoClient.connect(process.env.MONGO_URI, {
	poolSize: 100,
    retryWrites: true,
	writeConcern: {
		w: 'majority',
		wtimeout: 2500,
	},
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    console.error(err)
    process.exit(1)
}).then(async client => {
    await authDAO.injectDB(client.db(process.env.MONGO_DB_NAME))
    await usersDAO.injectDB(client.db(process.env.MONGO_DB_NAME))
    await productsDAO.injectDB(client.db(process.env.MONGO_DB_NAME))
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
})


