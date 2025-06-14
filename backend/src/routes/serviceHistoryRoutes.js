const express = require('express');
const router = express.Router();
const serviceHistoryController = require('../controllers/serviceHistoryController');

router.get('/members', serviceHistoryController.searchMembers);
router.post('/', serviceHistoryController.addServiceHistory);

module.exports = router; 