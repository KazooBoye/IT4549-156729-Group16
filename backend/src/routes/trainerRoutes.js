// File: src/routes/trainerRoutes.js
const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const trainerOnly = authorize('trainer', 'owner'); // Middleware short-hand

// Route để HLV lấy danh sách hội viên của mình
router.get('/members', protect, trainerOnly, trainerController.getAssignedMembers);

// Route để HLV cập nhật hồ sơ của một hội viên
router.put('/member/:id', protect, trainerOnly, trainerController.updateMemberProfileByTrainer);

// Route để HLV xóa một hội viên
router.delete('/member/:id', protect, trainerOnly, trainerController.deleteMemberByTrainer);

// Route để HLV lấy chi tiết của một hội viên
router.get('/member/:id', protect, trainerOnly, trainerController.getMemberDetails);

// --- Routes for Workout Sessions ---
router.get('/member/:memberId/sessions', protect, trainerOnly, trainerController.getMemberSessions);
router.post('/sessions', protect, trainerOnly, trainerController.addWorkoutSession);
router.put('/sessions/:sessionId', protect, trainerOnly, trainerController.updateWorkoutSession);


module.exports = router;