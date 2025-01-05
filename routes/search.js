const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');


router.get('/', searchController.getSearchProducts);

router.post('/add_to_search', searchController.addSearchProduct);

router.post('/remove_from_search', searchController.delSearchProduct);


module.exports = router;