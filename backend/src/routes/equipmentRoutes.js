// File: src/routes/equipmentRoutes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route để nhân viên lấy danh sách thiết bị
router.get(
    '/',
    equipmentController.getAllEquipment
);

// Route để nhân viên cập nhật một thiết bị
router.put(
    '/:id',
    protect,
    authorize('staff', 'owner'),
    equipmentController.updateEquipment
);

module.exports = router;