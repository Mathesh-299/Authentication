const jwttoken = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwttoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = {
    generateToken
};