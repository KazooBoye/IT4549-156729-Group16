const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// This route provides the list of packages to the frontend
router.get('/', packageController.getActivePackages);

module.exports = router;