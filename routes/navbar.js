const express = require('express');
const router = express.Router();
const productController = require('../controllers/navController');


// Route for AJAX search request
router.get('/', productController.searchProducts);

// Route for the search results page
router.get('/products', productController.getSearchResults);


module.exports = router;