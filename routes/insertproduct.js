const express = require('express');
const router = express.Router();
const client = require('../config/database.js');



router.get('/', (req, res) => {
	try {
		res.status(200).render('newproduct', { title: "Insert a new product" });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});



router.post('/addProduct', async (req, res) => {

	try {
		const { prodName, prodDescription, prodCategory, prodBrand, prodPrice, prodYear } = req.body;

		// Insert data into database
		const result = await client.query('INSERT INTO PRODUCTS (name, description, categoryid, brand, price, year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [prodName, prodDescription, prodCategory, prodBrand, prodPrice, prodYear]);

		// You can handle the result as needed
		console.log('Product added to the database:', result.rows[0]);

		res.send('Product added to the database successfully!');

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;