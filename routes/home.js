const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
	res.render('home', { title: "Welcome to Skroutz" });

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