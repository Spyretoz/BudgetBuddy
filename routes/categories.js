const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController.js');



router.get('/categories', categoryController.getCategories);


module.exports = router;