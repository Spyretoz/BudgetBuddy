const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');



exports.getSearchProducts = async (req, res) => {
	try {

		const { option } = req.query; // Get user option: 'lowest-price' or 'best-reviews'
		const searchList = req.session.compare || [];

		if (searchList.length === 0) {
			return res.status(400).json({ error: 'No products to compare' });
		}

		const products = await Product.findAll({
			raw: true,
			attributes: ['name', 'imageurl'],
			where: { ProductId: searchList },
			include: [
				{
					model: ProductRetailer,
					attributes: ['price'],
					required: false,
					include: [
						{
							model: Retailer,
							attributes: ['name'],
							required: false,
						},
					],
				},
			],
		});

		console.log(products);


		const results = products.map(product => ({
			productName: product.name,
			productImg: product.imageurl,
			price: product['ProductRetailers.price'],
			retailerName: product['ProductRetailers.Retailer.name'],
		}));

		console.log(results);
		
		res.status(200).render('search', { title: "Advanced Search", results });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};



exports.addSearchProduct = async (req, res) => {
	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	// Check if the product is already in the compare list
	if (req.session.compare.includes(productId)) {
		return res.status(400).json({ error: 'Product is already in the search list' });
	}

	// Optional: Limit the number of products to compare
	if (req.session.compare.length >= 5) {
		return res.status(400).json({ error: 'You can only compare up to 5 products' });
	}

	// Add product to the compare list
	req.session.compare.push(productId);

	res.json({ message: 'Product added to search list', compareList: req.session.compare });
};





exports.delSearchProduct = async (req, res) => {

	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	req.session.compare = req.session.compare.filter(id => id !== productId);

	res.json({ message: 'Product removed from comparison list', compareList: req.session.compare });
};