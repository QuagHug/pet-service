const express = require('express');
const router = express.Router();
const controller = require('../Controllers/adminController');
const tryCatch = require('../Middleware/tryCatch');
const checkAuth = require('../Middleware/checkAuth');

router
  .post('/login', tryCatch(controller.login))
  .use(checkAuth(process.env.ADMIN_ACCESS_TOKEN_SECRET))

  .get('/users', tryCatch(controller.getAllUsers))
  .get('/users/:id', tryCatch(controller.getUserById))

  .get('/services/category', tryCatch(controller.getServicesByCategory))
  .get('/services', tryCatch(controller.getAllServices))
  .get('/services/:id', tryCatch(controller.getServiceById))
  .post('/services', tryCatch(controller.createService))
  .put('/services', tryCatch(controller.updateService))
  .delete('/services/:id', tryCatch(controller.deleteService))

  .get('/stats', tryCatch(controller.getStats))
  .get('/clicks', tryCatch(controller.getAffiliateClicks));

module.exports = router;
