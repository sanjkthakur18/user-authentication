const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/userModel');
const { jwtToken } = require('../config/jwtToken');
const validateMongoId = require('../utils/validateMongoId');
const sendEmail = require('../controller/emailCtrl');

const createUser = async (req, res) => {
    const { firstname, lastname, email, password, mobile } = req.body;
    try {
        if (!firstname || !lastname || !email || !password || !mobile) {
            return res.status(400).send({ error: 'All fields are required' });
        }
        const findUserByEmail = await User.findOne({ email: email });
        const findUserByMobile = await User.findOne({ mobile: mobile });
        if (findUserByEmail) {
            return res.status(409).json({ error: { email: 'Email already exists. Please login' } });
        }
        if (findUserByMobile) {
            return res.status(409).json({ error: { mobile: 'Mobile already exists. Please login' } });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            mobile: mobile,
            password: hashedPassword
        });
        console.log(newUser);
        return res.status(200).json({ message: { message: 'User registered successfully' }, user: newUser });
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({ error: { email: 'Incorrect email or not found.' } });
        }

        const isPasswordMatched = await bcrypt.compare(password, findUser.password);
        if (!isPasswordMatched) {
            return res.status(401).json({ error: { password: 'Incorrect password.' } });
        }

        const rfrshToken = jwtToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id, {
            refreshToken: rfrshToken
        }, { new: true });

        res.cookie('refreshToken', rfrshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        });

        return res.status(200).json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            mobile: findUser.mobile,
            refreshToken: rfrshToken
        });

    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};


const handleRefreshToken = async (req, res) => {
    const cookie = req.cookies;
    // console.log(cookie);
    if (!cookie.refreshToken) { return res.status(404).send({ error: 'There is no token found in cookie' }) }
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({ refreshToken });
    if (!user) { return res.status(404).send({ error: 'No token found in DB or not matched' }) }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            res.status(500).send({ error: 'Something went wrong' });
        }
        console.log(decoded);
        const accessToken = jwtToken(user?._id);
        res.json({ accessToken });
    });
};

const logoutUser = async (req, res) => {
    const cookie = req.cookies;
    try {
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true
            });
            return res.sendStatus(204);
        }
        await User.findOneAndUpdate({ refreshToken: refreshToken }, {
            refreshToken: '',
        });
        await user.save();
        res.clearCookie('refreshToken', {
            secure: true,
        });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    validateMongoId(id);
    // try {
        const updateUser = await User.findByIdAndUpdate(id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        }, { new: true });
        return res.status(200).json({ updateUser });
    /* } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    } */
};

const getUser = async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const getUser = await User.findById(id);
        return res.status(200).json({ getUser });
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const getAllUser = async (req, res) => {
    try {
        const getAllUser = await User.find();
        return res.status(200).json({ getAllUser });
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        return res.status(200).json({ deleteUser });
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const updatePassword = async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoId(_id);
    try {
        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            const updatePassword = await user.save();
            return res.status(200).json({ updatePassword });
        }
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const forgotPasswordToken = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        if (!user) {
            return res.status(404).json({ error: { email: 'Email not found' } });
        }
        const token = resetToken;
        console.log('Token:', token);
        await user.save();
        const resetUrl = `Hi, Please follow this link to reset your password. This link is valid for 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            text: 'Hey user',
            subject: 'Forgot password link',
            html: resetUrl
        };
        sendEmail(data);
        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ error: { error: 'Server error' } });
    }
};

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const token = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(401).json({ error: 'Token expired, please try again later' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json({ user });
};

module.exports = { createUser, loginUser, handleRefreshToken, logoutUser, updateUser, deleteUser, getUser, getAllUser, updatePassword, resetPassword, forgotPasswordToken }