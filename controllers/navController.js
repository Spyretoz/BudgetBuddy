const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ProductRetailer = require('../models/productRetailerModel');
const { Op, Sequelize } = require('sequelize');


// Controller function to handle AJAX search requests
exports.searchProducts = async (req, res) => {
	const query = req.query.query;

	try {
		// Sequelize query with 'ILIKE' for case-insensitive matching
		const products = await Product.findAll({
			raw: true,
			attributes: [
				'ProductId',
				'name',
				'imageurl',
				[
					Sequelize.fn(
						'COALESCE',
						Sequelize.fn('MIN', Sequelize.col('ProductRetailers.Price')), // Minimum price
						Sequelize.literal("0.00") // Fallback when there's no price
					), 
					'minPrice'
				],
			],
			include: [
				{
					model: ProductRetailer,
					attributes: [],
					required: true, // This will use INNER JOIN
				},
				{
					model: Category,
					attributes: ['name'],
					required: false, // This will use LEFT OUTER JOIN
				}
			],
			where: {
				name: {
					[Op.iLike]: `%${query}%` // Use ILIKE for case-insensitive search
				}
			},
			group: ['Product.ProductID', 'Product.name', 'Product.imageurl', 'Category.name'], // Group by ProductID and CategoryId
		});
		
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching products', error });
	}
};

// Controller function to render the full search results page
exports.getSearchResults = async (req, res) => {
	const query = req.query.q;
	try {
		const products = await Product.findAll({
			raw: true,
			attributes: [
				'ProductId',
				'name',
				'imageurl',
				[
					Sequelize.fn(
						'COALESCE',
						Sequelize.fn('MIN', Sequelize.col('ProductRetailers.Price')), // Minimum price
						Sequelize.literal("0.00") // Fallback when there's no price
					), 
					'minPrice'
				],
			],
			include: [
				{
					model: ProductRetailer,
					attributes: [],
					required: false, // This will use LEFT OUTER JOIN
				},
				{
					model: Category,
					attributes: ['name'],
					required: false, // This will use LEFT OUTER JOIN
				}
			],
			where: {
				name: {
					[Op.iLike]: `%${query}%` // Use ILIKE for case-insensitive search
				}
			},
			group: ['Product.ProductID', 'Product.name', 'Product.imageurl', 'Category.name'], // Group by ProductID and CategoryId
		});


		// res.status(200).render('search', { products, query, title: query });
		res.status(200).render('products', { products, query, title: query });
	} catch (error) {
		res.status(500).json({ message: 'Error fetching search results', error });
	}
};