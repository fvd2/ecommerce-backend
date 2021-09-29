const UserController = require('../controllers/UserController')
const validateToken = require('../middlewares/validateToken')

const router = require('express').Router()

router.get('/', validateToken, UserController.getAccountDetails)
router.post('/delete', validateToken, UserController.deleteAccount)
router.post('/update/', validateToken, UserController.updateAccount)

module.exports = router
