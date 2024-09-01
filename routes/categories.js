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


module.exports = router;