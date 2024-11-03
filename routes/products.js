const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.js');


router.get('/:categoryname', productController.getProducts);

router.get('/:categoryname/:productid', productController.getProduct);


module.exports = router;