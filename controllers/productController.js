const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');
const RetailerReviews = require('../models/retailerReviewsModel');



exports.getProducts = async (req, res) => {
	
	const categoryName = req.params.categoryname; // Get categoryname from URL params

	// Fetch all products with associated categories
	try {
		const results = await Product.findAll({
			raw: true,
			attributes: [
				'ProductId',
				'name',
				'brand',
				'imageurl',
				'year',
				[sequelize.fn('COALESCE',
					sequelize.fn('MIN', sequelize.col('ProductRetailers.Price')), // Minimum price
					sequelize.literal("0.00") // Fallback when there's no price
				  ), 'minPrice'],
			],
			include: [
				{
					model: Category,
					attributes: ['name'],
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
			group: ['Product.ProductID', 'Product.name', 'Product.brand', 'Product.imageurl', 'Product.year', 'Category.name'], // Group by ProductID and CategoryId
		});

		// Extract products & unique retailers
		const products = [];
		// Add retailers to the unique list

		console.log(results);

		results.forEach(row => {
			// Check if product is already added
			if (!products.some(product => product.productid === row.productid)) {
				products.push({
					productid: row.productid,
					name: row.name,
					brand: row.brand,
					imageurl: row.imageurl,
					year:  row.year,
					minprice: parseFloat(row.minprice),
					categName: row['Category.name']
				});
			}
		});

		const brands = [...new Set(products.map(p => p.brand))]; // Extract unique brand
		const years = [...new Set(products.map(p => p.year))]; // Extract unique years

		// console.log(years);

		res.status(200).render('products', { products, brands, years, title: `${categoryName}` });
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
					attributes: [ 'Name','Website', 'Location', [ 'imageurl', 'retailerimg' ],
					[
						sequelize.fn( 'ROUND',
							sequelize.fn('AVG', sequelize.col('ProductRetailers->Retailer->RetailerReviews.Rating'))
						, 1),
						'avgRating'
					],
				],

					include: [{
						model: RetailerReviews,
						attributes: [],
						required: false,
					}],
				}]
			}],
			where : {productid: productId},

			group: [
				// Group by product columns
				'Product.productid',
				'Product.name',
				'Product.description',
				'Product.imageurl',
			
				// Group by ProductRetailer columns + PK 
				'ProductRetailers.Price',
				'ProductRetailers.PRODUCTLINK',
			
				// Group by Retailer columns + PK
				'ProductRetailers->Retailer.RetailerId',
				'ProductRetailers->Retailer.Name',
				'ProductRetailers->Retailer.Website',
				'ProductRetailers->Retailer.Location',
				'ProductRetailers->Retailer.imageurl',
			],

			order: [[ProductRetailer, 'Price', 'ASC']] // Order by Product Name in ascending order
		});

		// Check if the product exists
		if ((!productDetail) || (productDetail.length === 0)) {
		 	return res.status(404).send('Product not found');
		}

		// console.log(productDetail);

		// Transform the data into the desired structure
		const product = {
			productid: productDetail[0].productid,
			name: productDetail[0].name,
			description: productDetail[0].description,
			prdimg: productDetail[0].prdimg
		};

		const retailers = productDetail.map(item => ({
			RetailerId: item['ProductRetailers.Retailer.RetailerId'],
			Name: item['ProductRetailers.Retailer.Name'],
			Website: item['ProductRetailers.Retailer.Website'],
			Location: item['ProductRetailers.Retailer.Location'],
			Price: item['ProductRetailers.Price'],
			PrdctLink: item['ProductRetailers.PRODUCTLINK'],
			AvgRating: parseFloat(item['ProductRetailers.Retailer.avgRating'] ?? 0.0),
			RetailerImg: item['ProductRetailers.Retailer.retailerimg']
		}));

		// console.log(product);
		// console.log(retailers);

		res.status(200).render('productdetails', { product, retailers, title: product.name });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};