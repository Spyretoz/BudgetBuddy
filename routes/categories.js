const express = require('express');
const router = express.Router();
const client = require('../config/database.js');


router.get('/', (req, res) => {

	res.render('categories', { title: "Choose category" });
});


router.get('/all', async (req, res) => {

	try {
		// Show all categories from database
		
        const query = 'SELECT categoryname, IMAGEURL FROM CATEGORIES ORDER BY categoryid';
		const response = await client.query(query);

		res.json(response.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


router.get('/:categoryid', async (req, res) => {

	try {
		const categoryID = req.params.categoryid;
		res.render('products', { title: categoryID });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}

});


router.get('/:categoryid/products', async (req, res) => {

	try {
		const categoryID = req.params.categoryid;
        const query = 'SELECT PRODUCTS.productid, PRODUCTS.name, PRODUCTS.price, PRODUCTS.imageurl FROM PRODUCTS LEFT OUTER JOIN CATEGORIES ON CATEGORIES.categoryID = PRODUCTS.categoryID WHERE categoryname = $1';
        const values = [categoryID];
        const response = await client.query(query, values);

		res.json(response.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}

});


module.exports = router;