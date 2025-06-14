const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); // Note: I changed the import here

// @route   GET /api/users/trainers
// @desc    Get all trainers
// @access  Private (any logged-in user can see the list)
router.get('/trainers', protect, userController.getAllTrainers);

module.exports = router;