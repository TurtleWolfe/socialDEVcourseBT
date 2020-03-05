const express = require('express');
const { check } = require('express-validator');
const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', [
    // username must be.. what's the difference in .not.isEmpty and .exists?! episode #14
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    // username must be an email
    check('email', 'Please include a valid email').isEmail(),
    // password must be at least 6 chars long
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], register);

router.post('/login', [
    // username must be an email
    check('email', 'Please include a valid email').isEmail(),
    // password must be at least 6 chars long
    check('password', 'Please enter a valid password').exists()
], login);

router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;