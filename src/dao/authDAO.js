let sessions

module.exports = class AuthDAO {
	static injectDB = async db => {
		if (sessions) {
			return
		}
		try {
			sessions = await db.collection('sessions')
		} catch (err) {
			console.error(
				`Could not establish collection handle in authDAO: ${err}`
			)
			return { error: err }
		}
	}

	static login = async (email, refreshToken) => {
		try {
			await sessions.updateOne(
				{ email },
				{ $set: { refreshToken } },
				{ upsert: true }
			)
			return { success: true }
		} catch (err) {
			console.error(`Failed to login user: ${err}`)
			return { error: err }
		}
	}

    static findSession = async (refreshToken) => {
        try { 
            const user = await sessions.findOne(refreshToken)
            return user
        } catch (err) {
			console.error(`Failed to find user session: ${err}`)
			return { error: err }
		}
    }

	static logout = async (email) => {
        try {
            const { deletedCount } = await sessions.deleteOne({ email })
			if (deletedCount === 1) return { success: true }
			return { success: false }
		} catch (err) {
			console.error(`Failed to logout user: ${err}`)
			return { error: err }
		}
	}


	static updateAccessToken = async (refreshToken) => {
        try {
            const user = await sessions.findOne({ refreshToken })
            return user
        } catch (err) {
            console.error(`Failed to renew access token`)
            return { error: err }
        }
    }
}
