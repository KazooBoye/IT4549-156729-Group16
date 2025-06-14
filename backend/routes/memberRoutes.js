const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this middleware

// @route   GET api/members/training-history
// @desc    Get logged-in member's training history
// @access  Private
router.get('/training-history', authMiddleware, memberController.getTrainingHistory);

module.exports = router;
