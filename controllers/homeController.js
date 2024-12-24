// const client = require('../config/database.js');


exports.getHome = async (req, res) => {
	try {
		res.status(200).render('home', { title: "Welcome to BudgetBuddy" });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};


exports.getDealOfDay = async (req, res) => {
	try {
        // Show allacategories from database
        // const response = await client.query('SELECT NAME, IMAGEURL FROM PRODUCTS');
        // res.json(response.rows);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};