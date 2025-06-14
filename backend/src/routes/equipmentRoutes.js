const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

// Get all equipment
router.get('/', equipmentController.getAllEquipment);

// Update equipment status and note
router.put('/:id', equipmentController.updateEquipmentStatus);

module.exports = router; 