const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   POST api/bookings
// @desc    Create a new personal training booking
// @access  Private (Member)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['member']), // Only members can create bookings for themselves
    bookingController.createBooking
);

// @route   GET api/bookings/member
// @desc    Get all bookings for the logged-in member
// @access  Private (Member)
router.get(
    '/member',
    authMiddleware,
    roleMiddleware(['member']),
    bookingController.getMemberBookings
);

module.exports = router;
