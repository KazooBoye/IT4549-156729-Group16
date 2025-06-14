const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware'); // **IMPORTANT**: You need an auth middleware

// @route   POST /api/payments/initiate
// @desc    Initiate a payment for a package
// @access  Private (Only logged-in members can pay)
router.post(
  '/initiate',
  authMiddleware, // Protect this route
  paymentController.simulatePayment
);



module.exports = router;