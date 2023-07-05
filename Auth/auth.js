const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const SALT = 10;
const secret = 'Vkjd@srkgeah@#$R#tefnguihr'

const hashPassword = async (password) => {
    let salt = await bycrypt.genSalt(SALT)
    let hash = await bycrypt.hash(password, salt)
    return hash
}

const hashCompare = async (password, hashedPassword) => {
    return bycrypt.compare(password, hashedPassword)
}

const createToken = async (payload) => {
    let token = await jwt.sign(payload, secret, { expiresIn: '1d' })
    return token
}

const decodeToken = async (token) => {
    let data = await jwt.decode(token)
    console.log(data)
    return data
}

const validate = async (req, res, next) => {
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1]
        let data = await decodeToken(token)
        if (Math.round(Date.now() / 1000) <= data.exp) {
            next()
        }
        else {
            res.status(400).send({ message: 'Token expried' })
        }
    }
    else {
        res.status(400).send({ message: 'No token found' })
    }
}

const roleAdmin = async (req, res, next) => {
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1]
        let data = await decodeToken(token)
        if (data.role==='admin') {
            next()
        }
        else {
            res.status(400).send({ message: 'Admin access only' })
        }
    }
    else {
        res.status(400).send({ message: 'No token found' })
    }
}

module.exports = { hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin }