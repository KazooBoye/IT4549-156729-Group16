const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const authMiddleware = require('../middleware/authMiddleware'); // Your existing auth middleware
const roleMiddleware = require('../middleware/roleMiddleware'); // Middleware to check for 'trainer' role

// @route   GET api/trainer/members
// @desc    Get members associated with the logged-in trainer
// @access  Private (Trainer)
router.get(
    '/members',
    authMiddleware,
    roleMiddleware(['trainer', 'owner']), // Owner might also access this
    trainerController.getTrainerMembers
);

// @route   GET api/trainer/member-history/:memberId
// @desc    Get training history for a specific member (for trainer view)
// @access  Private (Trainer)
router.get(
    '/member-history/:memberId',
    authMiddleware,
    roleMiddleware(['trainer', 'owner']),
    trainerController.getMemberTrainingHistoryForTrainer
);

// @route   POST api/trainer/workout-session
// @desc    Add a workout session for a member
// @access  Private (Trainer)
router.post(
    '/workout-session',
    authMiddleware,
    roleMiddleware(['trainer', 'owner']),
    trainerController.addWorkoutSession
);

// @route   PUT api/trainer/workout-session/:sessionId
// @desc    Update a workout session for a member
// @access  Private (Trainer)
router.put(
    '/workout-session/:sessionId',
    authMiddleware,
    roleMiddleware(['trainer', 'owner']),
    trainerController.updateWorkoutSession
);

module.exports = router;
