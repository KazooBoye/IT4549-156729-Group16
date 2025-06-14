const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/equipment
// @desc    Get all equipment
// @access  Private (Staff/Owner)
router.get(
    '/',
    protect,
    authorize('staff', 'owner'),
    equipmentController.getAllEquipment
);

// @route   PUT /api/equipment/:id
// @desc    Update a specific piece of equipment
// @access  Private (Staff/Owner)
router.put(
    '/:id',
    protect,
    authorize('staff', 'owner'),
    equipmentController.updateEquipment
);

module.exports = router;