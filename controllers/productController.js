const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');





exports.getProducts = async (req, res) => {
	try {
		const categoryName = req.params.categoryname;
		console.log(categoryName);

		// Fetch all products with associated categories
		const products = await Product.findAll({
			raw: true,
			attributes: [
				'ProductId',
				'name',
				'imageurl',
				[sequelize.fn('MIN', sequelize.col('ProductRetailers.Price')), 'MinPrice']
			],
			include: [
				{
					model: Category,
					attributes: [],
					where: {
						name: categoryName
					}
				},
				{
					model: ProductRetailer,
					attributes: []
				}
			],
			group: ['Product.ProductID', 'Product.name', 'Product.imageurl'], // Group by ProductID and CategoryId
		});


		res.status(200).render('products', { products, title: categoryName });

		console.log(products);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};




exports.getProduct = async (req, res) => {

	try {
		const productname = req.params.productname;
		const productId = req.params.productid; // Assuming ID is passed as a URL parameter


		// Fetch the product with the specified ID from PRODUCTS table, including its category
		const product = await Product.findByPk(productId, {
			raw: true,
			attributes: [ 'productid', 'name', 'description', 'imageurl' ],
			// include: [
			// {
			// 	model: ProductRetailer,
			// 	attributes: [ 'Price', 'PRODUCTLINK', 'IMAGEURL' ]
			// },
			// {
			// 	model: Retailer,
			// 	attributes: [ 'Name','Website', 'Location', ],
			// }
			// ],

		});

		// Check if the product exists
		if (!product) {
			return res.status(404).send('Product not found');
		}



		res.status(200).render('productdetails', { title: productname });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};





// // Controller to fetch a specific product by ID
// exports.getProductById = async (req, res) => {
// 	try {
// 		const productId = req.params.productid; // Assuming ID is passed as a URL parameter
  
// 	  	// Fetch the product with the specified ID from PRODUCTS table, including its category
// 		const product = await Product.findByPk(productId, {
// 			include: [
// 			{
// 				model: Category,
// 				attributes: ['CategoryId', 'name'],
// 			},
// 			],
// 		});
  
// 		// Check if the product exists
// 		if (!product) {
// 			return res.status(404).send('Product not found');
// 		}
  
// 		// Render a view or send the product data as JSON
// 		res.render('productDetail', { product });
// 	} catch (error) {
// 		console.error('Error fetching product:', error);
// 		res.status(500).send('Internal Server Error');
// 	}
//   };

// exports.getProductDetails = async (req, res) => {

// 	try {

// 		const productID = req.params.productid;
// 		const query = 'SELECT PRODUCTS.productid, PRODUCTS.name as PRDNAME, PRODUCTS.DESCRIPTION, PRODUCTS.name, PRODUCTS.imageurl AS PRODIMG, PRODUCTRETAILERS.PRICE, PRODUCTRETAILERS.PRODUCTLINK, RETAILERS.NAME AS RETAILNAME, RETAILERS.website, RETAILERS.location, RETAILERS.IMAGEURL AS RETAILERIMG FROM PRODUCTS LEFT OUTER JOIN PRODUCTRETAILERS ON PRODUCTRETAILERS.PRODUCTID = PRODUCTS.PRODUCTID LEFT OUTER JOIN RETAILERS ON RETAILERS.RETAILERID = PRODUCTRETAILERS.RETAILERID WHERE PRODUCTS.productid = $1 ORDER BY PRICE';
		
// 		const value = [productID];
// 		// const productinfo = await client.query(query, value);

// 		// // console.log(productinfo.rows);
// 		// res.json(productinfo.rows);

// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send('Internal Server Error');
// 	}
// };