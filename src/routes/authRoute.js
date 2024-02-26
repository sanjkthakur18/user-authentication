const express = require('express');
const userCtrl = require('../controller/userCtrl');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register-user', userCtrl.createUser);
router.post('/login-user', userCtrl.loginUser);
router.get('/logout-user', authMiddleware, userCtrl.logoutUser);
router.put('/:id/update-user', authMiddleware, userCtrl.updateUser);
router.get('/:id/single-user', userCtrl.getUser);
router.get('/all-users', userCtrl.getAllUser);
router.delete('/:id/delete-user', userCtrl.deleteUser)
router.put('/update-password', authMiddleware, userCtrl.updatePassword);
router.post('/forgot-password-token', userCtrl.forgotPasswordToken);
router.put('/reset-password/:token', userCtrl.resetPassword);

module.exports = router;