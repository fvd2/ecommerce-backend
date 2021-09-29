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
			await credentials.insertOne({ userId: userId.insertedId, password: hash })
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

	static getAccountDetails = async email => {
		return await users.findOne({ email })
	}

	static deleteUser = async email => {
		try {
			const deleteUserResult = await credentials.deleteOne({ email })
			if (deleteUserResult.deletedCount === 1) return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to delete user: ${err}`)
			return { error: err }
		}
	}

	static updateEmail = async (currentEmail, newEmail) => {
		try {
			const updateUserResult = await users.updateOne(
				{
					email: currentEmail
				},
				{ $set: { email: newEmail } }
			)
			const updateCredentialsResult = await credentials.updateOne(
				{
					email: currentEmail
				},
				{ $set: { email: newEmail } }
			)
			const updateSessionResult = await sessions.updateOne(
				{
					email: currentEmail
				},
				{ $set: { email: newEmail } }
			)
			if (
				updateUserResult.modifiedCount === 1 &&
				updateCredentialsResult.modifiedCount === 1 &&
				updateSessionResult.modifiedCount === 1
			)
				return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to update email: ${err}`)
			return { error: err }
		}
	}
	static updateAccount = async (email, updateObj) => {
		try {
			const updateAccountResult = await users.updateOne(
				{
					email
				},
				{ $set: updateObj }
			)
			if (updateAccountResult.modifiedCount === 1) return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to update account: ${err}`)
			return { error: err }
		}
	}
}
