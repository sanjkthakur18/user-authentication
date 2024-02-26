const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Decode:', decoded);
                const user = await User.findById(decoded?.id);
                console.log('User in Authmiddleware:', user);
                req.user = user;
                next();
            }
        } catch (error) {
            console.log('Authmiddleware Error:', error);
            res.status(401).send({ message: 'Not Authorized or Token Expired. Please Login Again' });
        }
    } else {
        res.status(404).send({ message: 'There is no token attached to headers' });
    }
};

module.exports = authMiddleware;