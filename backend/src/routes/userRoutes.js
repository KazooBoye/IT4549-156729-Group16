const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const ownerOnly = authorize('owner');

// --- GET Routes ---
router.get('/', protect, ownerOnly, userController.getAllUsers);
router.get('/trainers', protect, userController.getAllTrainers);

router.get('/unassigned-members', protect, authorize('trainer', 'staff', 'owner'), userController.getUnassignedMembers);

// --- POST Route ---
router.post('/', protect, ownerOnly, userController.createUser);

// --- PUT Routes (Order is very important here!) ---
// The most specific route must come first.
router.put('/:id/reset-password', protect, ownerOnly, userController.resetUserPassword);
// The generic update route comes after.
router.put('/:id', protect, ownerOnly, userController.updateUser);

// --- DELETE Route ---
router.delete('/:id', protect, ownerOnly, userController.deleteUser);

module.exports = router;