const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Staff register new member
router.post('/register', memberController.registerMember);
// Get member by code
router.get('/by-code/:code', memberController.getMemberByCode);
// Renew member package
router.post('/renew-package', memberController.renewMemberPackage);

module.exports = router; 