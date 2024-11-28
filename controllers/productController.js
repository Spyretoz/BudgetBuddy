const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');


exports.getProducts = async (req, res) => {
	
	const categoryName = req.params.categoryname; // Get categoryname from URL params

	// Fetch all products with associated categories
	try {
		const products = await Product.findAll({
			raw: true,
			attributes: [
				'ProductId',
				'name',
				'imageurl',
				[sequelize.fn('COALESCE',
					sequelize.fn('MIN', sequelize.col('ProductRetailers.Price')), // Minimum price
					sequelize.literal("0.00") // Fallback when there's no price
				  ), 'minPrice'],
			],
			include: [
				{
					model: Category,
					attributes: [],
					where: {
						name: categoryName
					},
				},
				{
					model: ProductRetailer,
					attributes: [],
					required: false, // This will use LEFT OUTER JOIN

				}
			],
			group: ['Product.ProductID', 'Product.name', 'Product.imageurl'], // Group by ProductID and CategoryId
		});

		res.status(200).render('products', { products, title: `${categoryName}` });


	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};




exports.getProduct = async (req, res) => {

	try {
		const productId = req.params.productid; // Assuming ID is passed as a URL parameter
		// console.log(productId);

		if (!productId || isNaN(productId)) {
			// Handle case when productId is null, undefined, or not a valid number
			return res.status(400).send('Invalid Product ID');
		}


		// Fetch the product with the specified ID from PRODUCTS table, including its category
		const productDetail = await Product.findAll({
			raw: true,
			attributes: [ 'productid', 'name', 'description', ['imageurl', 'prdimg'] ],
			include: [{
				model: ProductRetailer,
				attributes: [ 'Price', 'PRODUCTLINK' ],
				required: false, // This will use LEFT OUTER JOIN
				include: [{
					model: Retailer,
					attributes: [ 'Name','Website', 'Location', [ 'imageurl', 'retailerimg' ] ],
				}]
			}],
			where : {productid: productId},

			order: [[ProductRetailer, 'Price', 'ASC']], // Order by Product Name in ascending order
		});

		// Check if the product exists
		if ((!productDetail) || (productDetail.length === 0)) {
		 	return res.status(404).send('Product not found');
		}
		else {
			res.status(200).render('productdetails', { productDetail, title: productDetail[0].name });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};