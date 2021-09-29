const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token==null) return res.sendStatus(401)

    // validate Access Token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            if (err.name==='TokenExpiredError') return res.status(401).send({error: 'token expired'})
            res.status(401).send({ error: 'Invalid token'})
        } else {
            res.locals.userId = user.userId
            next() 
    }})
}