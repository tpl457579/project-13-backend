const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '1y' })
}

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY)
}

module.exports = { generateToken, verifyJwt }
