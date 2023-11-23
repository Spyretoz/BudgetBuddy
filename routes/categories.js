const express = require('express');
const router = express.Router();
const client = require('../config/database.js')


router.get('/', async (req, res) => {

	res.render('categories', { title: "Choose category" });

	try {
		// Show allacategories from database
		categories = await client.query('SELECT * FROM CATEGORIES');
		console.log(categories.rows);
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;