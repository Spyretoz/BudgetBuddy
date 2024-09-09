const Category = require('../models/categoryModel');


exports.getCategories = async (req, res) => {
	try {
		// Fetch all products with associated categories
		const categories = await Category.findAll(
			{
				raw: true,
				attributes: ['name', 'imageurl']
			}
		);

		// Render products view with fetched data
		res.render('categories', { categories, title: "Choose category" } );
		// console.log(categories);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};