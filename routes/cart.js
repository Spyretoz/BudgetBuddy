const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item to cart
router.post('/add', cartController.addToCart);

// Remove item from cart
router.post('/remove', cartController.removeFromCart);

// View cart
router.get('/', cartController.viewCart);

module.exports = router;