const express = require('express');
const router = express.Router();
const client = require('../config/database.js');


router.get('/', (req, res) => {

	res.render('products', { title: "Show all products" });
});


router.get('/brands', async (req, res) => {

	try {
		// Show allacategories from database
		const response = await client.query('SELECT distinct BRAND FROM Products');
		res.json(response.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});



router.get('/all', async (req, res) => {

	try {
		// Show allacategories from database
		const response = await client.query('SELECT * FROM Products');
		res.json(response.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;