const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// --- Routes for Staff ---
router.get(
    '/',
    protect,
    authorize('staff', 'owner'),
    feedbackController.getAllFeedback
);
router.put(
    '/:id',
    protect,
    authorize('staff', 'owner'),
    feedbackController.updateFeedback
);

// --- Route for Members ---
router.post(
    '/',
    protect,
    authorize('member'), // Only members can submit feedback
    feedbackController.createFeedback
);

module.exports = router;