const jwt = require('jsonwebtoken')
const AuthDAO = require('../dao/authDAO')
const UsersDAO = require('../dao/usersDAO')
const bcrypt = require('bcryptjs')

const createHash = async password => await bcrypt.hash(password, 10)
const compareHash = async (password, hash) =>
	await bcrypt.compare(password, hash)

module.exports = {
	register: async (req, res) => {
		if (
			!req.body.email ||
			!/[A-Za-z0-9]+@[A-Za-z0-9]{2,}.[A-Za-z]{2,}/i.test(req.body.email)
		) {
			res.status(400).json(
				{message: 'E-mail address is empty or incorrectly formatted'}
			)
		}
		if (!req.body.password || req.body.password.length < 8) {
			res.status(400).json({message: 'Password is empty or less than 8 characters'})
		}
		const foundUser = await UsersDAO.getUser(req.body.email)
		if (foundUser) {
			res.status(400).json(
				{message: 'A user with this e-mail address already exists'}
			)
		} else {
			const result = await UsersDAO.addUser(
				req.body.email,
				await createHash(req.body.password)
			)
			if (result.success) return res.status(201).json(result)
			return res.status(404).json(result)
		}
	},
	login: async (req, res) => {
		if (
			!req.body.email ||
			!/[A-Za-z0-9]+@[A-Za-z0-9]{2,}.[A-Za-z]{2,}/i.test(req.body.email)
		) {
			res.status(400).send(
				{message: 'E-mail address is empty or incorrectly formatted'}
			)
		}
		if (!req.body.password || req.body.password.length < 8) {
			res.status(400).send({message: 'Password is empty or less than 8 characters'})
		}
		const userData = await UsersDAO.getUser(req.body.email)
		if (!userData) return res.status(400).send({message: 'Unknown email address'})
		if (!compareHash(req.body.password, userData.password))
			return res
				.status(401)
				.send({ message: 'Entered credential are invalid' })
		else {
			const accessToken = jwt.sign(
				{ email: req.body.email },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: 60 * 15 }
			)
			const refreshToken = jwt.sign(
				{ email: req.body.email },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: 60 * 24 * 30 }
			)
			res.cookie('refreshToken', refreshToken, {
				secure: process.env.NODE_ENV !== 'DEVELOPMENT',
				httpOnly: true,
				sameSite: true
			}).json({ accessToken })
			await AuthDAO.login(userData.email, refreshToken)
		}
	},
	logout: async (req, res) => {
		const user = await AuthDAO.findSession(req.cookies)
		if (user) {
			const result = await AuthDAO.logout(user.email)
			if (result.success) {
				res.status(200).send({
					message: 'Successfully logged out user'
				})
			} else res.status(401).send({error: 'Could not log user out'})
		} else res.status(404).send({ error: 'Could not find session' })
	},
	token: async (req, res) => {
		const user = await AuthDAO.updateAccessToken(req.cookies.refreshToken)
		if (user) {
			const accessToken = jwt.sign(
				{ email: user.email },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: 60 * 15 }
			)
			res.status(200).send({ accessToken })
		} else
			res.status(401).send({
				error: 'no refresh token was found - please login again'
			})
	}
}
