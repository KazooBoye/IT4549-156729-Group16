// File: src/routes/serviceHistoryRoutes.js
const express = require('express');
const router = express.Router();
const serviceHistoryController = require('../controllers/serviceHistoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route để nhân viên tạo một bản ghi lịch sử mới
router.post(
    '/',
    protect,
    authorize('staff', 'owner'),
    serviceHistoryController.createServiceHistory
);

module.exports = router;