let users
let credentials
let sessions

module.exports = class UsersDAO {
	static injectDB = async db => {
		if (users && credentials && sessions) {
			return
		}
		try {
			users = await db.collection('users')
			credentials = await db.collection('credentials')
			sessions = await db.collection('sessions')
		} catch (err) {
			console.error(
				`Could not establish collection handles in usersDAO: ${err}`
			)
		}
	}

	static addUser = async (email, hash) => {
		try {
			const userId = await users.insertOne({ email })
			await credentials.insertOne({
				userId: userId.insertedId,
				password: hash
			})
			return { success: true }
		} catch (err) {
			console.error(`Failed to register user: ${err}`)
			return { error: err }
		}
	}

	static getCredentials = async ObjectID => {
		return await credentials.findOne({ userId: ObjectID }, { password: 1 })
	}

	static getUser = async email => {
		return await users.findOne({ email })
	}

	static getAccountDetails = async userId => {
		return await users.findOne({ _id: userId })
	}

	static deleteUser = async userId => {
		try {
			const deleteCredentialsResult = await credentials.deleteOne({
				userId
			})
			const deleteAccountResult = await users.deleteOne({ _id: userId })
			if (
				deleteCredentialsResult.deletedCount === 1 &&
				deleteAccountResult.deletedCount === 1
			)
				return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to delete user: ${err}`)
			return { error: err }
		}
	}

	static update = async (userId, updateObj) => {
		try {
			const updateAccountResult = await users.updateOne(
				{
					_id: userId
				},
				{ $set: updateObj }
			)
			if (updateAccountResult.modifiedCount === 1)
				return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to update account: ${err}`)
			return { error: err }
		}
	}
}
