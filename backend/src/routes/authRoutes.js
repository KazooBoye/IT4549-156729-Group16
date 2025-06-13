const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const { protect } = require('../middlewares/authMiddleware'); // Example for protected routes

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.loginUser);

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
