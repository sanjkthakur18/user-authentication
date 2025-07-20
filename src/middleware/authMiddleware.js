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




// const rateLimitMap = {};
// const WINDOW_MS = 60 * 1000;
// const MAX_REQ = 5;

// const rateLimiterMiddlewareLogin = (req, res, next) => {
//     const ip = req.ip;
//     const email = req.body?.email || 'unknown';
//     const now = Date.now();

//     const key = `login:${email}:${ip}`;

//     if (!rateLimitMap[key]) {
//         rateLimitMap[key] = [];
//     }

//     rateLimitMap[key] = rateLimitMap[key].filter(t => now - t < WINDOW_MS);

//     if (rateLimitMap[key].length >= MAX_REQ) {
//         return res.status(429).json({ message: 'Too many login attempts for this email. Try again later.' });
//     }

//     rateLimitMap[key].push(now);
//     next();
// };

// const rateLimiterMiddleware = (req, res, next) => {
//     const ip = req.ip;
//     const email = req.body?.id || 'unknown';
//     const now = Date.now();

//     const key = `login:${email}:${ip}`;

//     if (!rateLimitMap[key]) {
//         rateLimitMap[key] = [];
//     }

//     rateLimitMap[key] = rateLimitMap[key].filter(t => now - t < WINDOW_MS);

//     if (rateLimitMap[key].length >= MAX_REQ) {
//         return res.status(429).json({ message: 'Too many login attempts for this email. Try again later.' });
//     }

//     rateLimitMap[key].push(now);
//     next();
// };

// module.exports = { rateLimiterMiddlewareLogin, rateLimiterMiddleware }
