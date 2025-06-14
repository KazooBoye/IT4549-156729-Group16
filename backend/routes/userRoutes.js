const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this
// Potentially roleMiddleware if needed for some user routes, but not for getAllTrainers if public/member accessible

// @route   GET api/users/trainers
// @desc    Get all trainers
// @access  Private (e.g., Members, Staff, Trainers, Owner can see this)
router.get('/trainers', authMiddleware, userController.getAllTrainers);


module.exports = router;
