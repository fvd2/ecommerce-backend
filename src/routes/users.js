const UserController = require('../controllers/UserController')
const validateToken = require('../middlewares/validateToken')

const router = require('express').Router()

router.get('/', validateToken, UserController.getAccountDetails)
router.post('/delete', validateToken, UserController.delete)
router.post('/update/email', validateToken, UserController.updateEmail)
router.post('/update/account', validateToken, UserController.updateAccount)

module.exports = router
