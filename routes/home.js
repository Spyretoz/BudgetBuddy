const express = require('express');
const router = express.Router();
const client = require('../config/database.js');



router.get('/', async (req, res) => {
	res.render('home', { title: "Welcome to Skroutz" });
});


router.get('/dealofday', async (req, res) => {
	try {
		// Show allacategories from database
		const response = await client.query('SELECT IMAGEURL, PRICE FROM PRODUCTS');
		res.json(response.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;