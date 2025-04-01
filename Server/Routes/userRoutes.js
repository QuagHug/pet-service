const express = require('express');
const router = express.Router();
const controller = require('../Controllers/userController');
const serviceController = require('../Controllers/serviceController');
const tryCatch = require('../Middleware/tryCatch');
const checkAuth = require('../Middleware/checkAuth');
const checkMembership = require('../Middleware/checkMembership');
const authMiddleware = require('../Middleware/authMiddleware');

router
  .post('/register', tryCatch(controller.register))
  .post('/login', tryCatch(controller.login))

  .post('/:id/payment', tryCatch(controller.payment))
  .get('/payment/success', tryCatch(controller.success))
  .post('/payment/cancel', tryCatch(controller.cancel))

  .get('/products', tryCatch(controller.getAllProducts))
  .get('/products/top-selling', tryCatch(controller.getTopSellingProducts))
  .get('/products/:id', tryCatch(controller.getProductById))
  .get('/products/category/:categoryname', tryCatch(controller.getProductsByCategory))

  // Protected routes with authMiddleware
  .get('/:id/membership', authMiddleware, tryCatch(controller.getMembership))
  .get('/:id/favorites', authMiddleware, tryCatch(controller.getFavorites))
  .post('/:id/favorites/:serviceId', authMiddleware, tryCatch(controller.addToFavorites))
  .delete('/:id/favorites/:serviceId', authMiddleware, tryCatch(controller.removeFromFavorites))

  .get('/:id/cart', tryCatch(controller.showCart))
  .post('/:id/cart', tryCatch(controller.addToCart))
  .put('/:id/cart', tryCatch(controller.updateCartItemQuantity))
  .delete('/:id/cart/:product', tryCatch(controller.removeFromCart))

  .get('/:id/wishlist', tryCatch(controller.showWishlist))
  .post('/:id/wishlist', tryCatch(controller.addToWishlist))
  .delete('/:id/wishlist/:product', tryCatch(controller.removeFromWishlist))

  .get('/:id/orders', tryCatch(controller.showOrders));

// Service routes
router
  .get('/services', tryCatch(serviceController.getAllServices))
  .get('/services/search', checkAuth(process.env.USER_ACCESS_TOKEN_SECRET), checkMembership, tryCatch(serviceController.searchServices))
  .get('/services/nearby', checkAuth(process.env.USER_ACCESS_TOKEN_SECRET), checkMembership, tryCatch(serviceController.getNearbyServices))
  .get('/services/:id', tryCatch(serviceController.getServiceById))
  .get('/services/category/:categoryname', tryCatch(serviceController.getServicesByCategory))

// Protected routes
router
  .use(checkAuth())
  .post('/:id/track/:serviceId', tryCatch(serviceController.trackAffiliateClick))
  .post('/services/:id/review', tryCatch(serviceController.addReview));

module.exports = router;
