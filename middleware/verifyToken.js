require("dotenv").config();

function checkToken(req, res, next) {
    const token = process.env.AUTH_TOKEN
    const sent = req.headers['authorization']

    if(`Bearer ${token}` === sent || sent === token) {
        next()
    }else {
        return res.status(403).json({
            'Error': "Access forbidden, invalid Token"
        })
    }
}

module.exports = checkToken