const UsersDAO = require('../dao/usersDAO')
const ObjectID = require('mongodb').ObjectID

module.exports = {
	getAccountDetails: async (req, res) => {
        const email = res.locals.email
		console.log(email)
        if (!email) return res.sendStatus(400)
		const accountDetails = await UsersDAO.getAccountDetails(email)
		if (accountDetails)
			return res.status(200).send(accountDetails)
		return res.sendStatus(404)
	},
	deleteAccount: async (req, res) => {
        const email = res.locals.email
        if (!email) return res.sendStatus(400)
		const { success } = await UsersDAO.deleteUser(email)
		if (success)
			return res.status(200).send({
				message: `Successfully deleted user: ${email}`,
			})
		return res.sendStatus(404)
	},
	updateAccount: async (req, res) => {
		const userId = res.locals.userId
		const updateObj = req.body
		const updatedAccount = await UsersDAO.update(ObjectID(userId), updateObj)
		if (updatedAccount.success === true) return res.status(201).send({ message: `Successfully updated account details`})
		return res.status(400).send({message: 'bad request'})
	},
}
