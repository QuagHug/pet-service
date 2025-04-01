const express = require('express');
const router = express.Router();
const momoPaymentController = require('../Controllers/momoPaymentController');
const authMiddleware = require('../Middleware/authMiddleware');

// IMPORTANT: Put the notification route FIRST - order matters in Express
// MoMo payment notification - NO authentication (MoMo server calls this)
router.post('/momo/notify', (req, res, next) => {
  console.log('MoMo notification received at endpoint');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
}, momoPaymentController.handleMomoNotification);

// Other routes that require authentication
router.post('/momo/:userId', authMiddleware, momoPaymentController.createMomoPayment);
router.get('/momo/status/:orderId', authMiddleware, momoPaymentController.checkMomoPaymentStatus);

// Handle payment result (redirect from MoMo)
router.get('/momo/result', momoPaymentController.handlePaymentResult);

module.exports = router; 