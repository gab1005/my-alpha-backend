const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = (req.cookies.access_token)

    if (!token) {
        res.send("Hey faltou mandar o token!")
    } else {
        jwt.verify(token, 'secret', (error, decoded) => {
            if (error) {
                console.log(error)
                res.send("Deu erro!")
            } else {
                req.user_id = decoded.id
                next()
            }
        })
    }
}

module.exports = verifyJWT