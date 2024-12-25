const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/profile', userController.getProfile);

router.get('/orders', userController.getOrders);

router.get('/reviews', userController.getReviews);


module.exports = router;