const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/members/register
// @desc    Register a new member
// @access  Private to staff/owner
router.post(
    '/register',
    protect, // Must be logged in
    authorize('staff', 'owner', 'trainer'), // Only staff or owners can access this
    memberController.registerMember
);

// @route   POST /api/members/extend-subscription
// @desc    Extend an existing member's subscription
// @access  Private to staff/owner
router.post(
    '/extend-subscription',
    protect, // User must be logged in
    authorize('staff', 'owner'), // Only specific roles can access this
    memberController.extendSubscription
);

// @route   GET /api/members/my-workout-history
// @desc    Get the workout history for the currently logged-in member
// @access  Private (Member)
router.get(
    '/my-workout-history',
    protect,
    authorize('member'), // Ensure only members can access this
    memberController.getMyWorkoutHistory
);


module.exports = router;

