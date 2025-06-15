const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/payments/initiate
// @desc    Initiate a payment for a package
// @access  Private (Only logged-in members can pay)
router.post(
  '/simulate',
  protect, // Protect this route
  paymentController.simulatePayment
);



module.exports = router;