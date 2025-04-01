const express = require('express');
const router = express.Router();
const serviceController = require('../Controllers/serviceController');

// Public routes (no authentication required)
router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/nearby', serviceController.getNearbyServices);
router.get('/:id', serviceController.getServiceById);

module.exports = router; 