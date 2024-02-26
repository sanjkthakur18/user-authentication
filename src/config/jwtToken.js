const jwt = require("jsonwebtoken");

const jwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

module.exports = {jwtToken};