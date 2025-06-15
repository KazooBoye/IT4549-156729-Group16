// File: src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const ownerOnly = authorize('owner');

// Route to get all settings
router.get('/', protect, ownerOnly, settingsController.getAllSettings);

// Route to update settings
router.put('/', protect, ownerOnly, settingsController.updateSettings);

module.exports = router;