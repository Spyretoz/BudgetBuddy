const express = require('express');
const router = express.Router();
const client = require('../config/database.js');



router.get('/', async (req, res) => {
	try {
		res.status(200).render('home', { title: "Welcome to Skroutz" });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
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