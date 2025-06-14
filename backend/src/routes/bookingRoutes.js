const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware'); // Using your Sequelize-based middleware

// @route   POST /api/bookings
// @desc    Create a new booking (by a member)
// @access  Private (Member)
router.post(
    '/',
    protect,
    authorize('member'),
    bookingController.createBooking
);

// @route   GET /api/bookings/member
// @desc    Get all bookings for the logged-in member
// @access  Private (Member)
router.get(
    '/member',
    protect,
    authorize('member'),
    bookingController.getMemberBookings
);

module.exports = router;