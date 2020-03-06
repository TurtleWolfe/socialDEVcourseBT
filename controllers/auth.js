const crypto = require('crypto');
const gravatar = require('gravatar');
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
    //check login attempts
    if (req.session.login_attempts > 4) {
        return res.status(400).json({ msg: 'you try to brute force me?' });
    }
    const errors = validationResult(req);
    // Validation Errors carried in from //routes/auth.js
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            success: false,
            errors: errors.array()
        });
    }

    const { name, email, password, role } = req.body;
    try {
        // See if User already exists
        let user = await User.findOne({ email });
        if (user) {
            //incrament login attempts
            req.session.login_attempts = (req.session.login_attempts || 0) + 1;
            return res
                .status(422)
                .json({
                    success: false,
                    data: { email },
                    errors: [{
                        msg: 'User may already exists'
                    }]
                });
        }

        // Get User's Gravatar
        const avatar = gravatar.url(email, {
            s: `200`,   //size
            r: `pg`,    //rating
            d: `mm`     //default image
        });
        // Create user
        user = await User.create({
            name,
            email,
            avatar,
            password,
            role,
        });

        // while Validation is redundant in the Controller and the Model,
        // I felt like double encrypting was over kill..
        // so I left it in models/User.js under UserSchema.pre

        //plus it would have already been saved
        //in the previous step of user = await User.create({..

        // const salt = await bcrypt.genSalt(10);
        // this.password = await bcrypt.hash(this.password, salt);

        // Return JsonWebToken
        sendTokenResponse(user, 201, res);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error; Controllers/Auth.JS/Register');
    }
});

// @desc      Login user & Get Token
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    //check login attempts
    if (req.session.login_attempts > 10) {
        return res.status(400).json({ msg: 'you try to brute force me?' });
    }
    const { email, password } = req.body;
    try {
        // Validate email & password
        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            //incrament login attempts
            req.session.login_attempts = (req.session.login_attempts || 0) + 1;
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            //incrament login attempts
            req.session.login_attempts = (req.session.login_attempts || 0) + 1;
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error; Controllers/Auth.JS/Login');
    }
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(204).json({
        success: true,
        data: {},
    });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');

    return res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(201).json({
        success: true,
        data: user,
    });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 201, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message,
        });

        return res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
        });
}; 