const express = require('express');
const router = express.Router();
const client = require('../config/database.js');



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
		const query = "SELECT PRODUCTS.productid, PRODUCTS.name, PRODUCTS.imageurl, MIN(PRODUCTRETAILERS.PRICE) AS PRICE FROM PRODUCTS LEFT OUTER JOIN CATEGORIES ON CATEGORIES.categoryID = PRODUCTS.categoryID LEFT OUTER JOIN PRODUCTRETAILERS ON PRODUCTRETAILERS.productID = PRODUCTS.productID WHERE CATEGORIES.categoryname = $1 GROUP BY PRODUCTS.productid, PRODUCTS.name, PRODUCTS.imageurl";
		
		const values = [categoryID];
		const products = await client.query(query, values);

		//console.log(products.rows);
		res.json(products.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


router.get('/:categoryid/:productid', async (req, res) => {

	try {
		const productID = req.params.productid;
		const query = 'SELECT PRODUCTS.productid, PRODUCTS.name, PRODUCTS.imageurl, RETAILERS.name, RETAILERS.website, RETAILERS.location FROM PRODUCTS LEFT OUTER JOIN RETAILERS ON RETAILERS.productid = PRODUCTS.productid WHERE productid = $1';
		//PRODUCTS.price, 
		
		const values = [productID];
		const products = await client.query(query, values);

		console.log(products.rows);
		res.json(products.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;