const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// @route   GET /api/services
// @desc    Get all active services
// @access  Public (as we decided)
router.get('/', serviceController.getActiveServices);

module.exports = router;