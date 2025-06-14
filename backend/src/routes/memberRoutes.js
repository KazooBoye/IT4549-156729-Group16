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
    authorize('staff', 'owner'), // Only staff or owners can access this
    memberController.registerMember
);

module.exports = router;