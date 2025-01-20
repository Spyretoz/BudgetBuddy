const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/profile', userController.getProfile);

router.post('/profile', userController.updateProfile);

router.get('/orders', userController.getOrders);

router.get('/reviews', userController.getReviews);


module.exports = router;