// const sequelize = require('../config/database'); // Import the Sequelize instance

// const Product = require('../models/productModel');
// const ProductRetailer = require('../models/productRetailerModel');



const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');
const RetailerReviews = require('../models/retailerReviewsModel');

exports.getHome = async (req, res) => {
	try {
		// Fetch a random or selected product for the deal
		// const dealProduct = await Product.findOne({
		//     raw: true,
		//     attributes: ['ProductID', 'name', 'imageurl',

				
		//     ],
		//     include:{
		//         model: ProductRetailer,
		//         attributes: [
		//             [sequelize.fn('COALESCE',
		//             sequelize.fn('MIN', sequelize.col('price')), // Minimum price
		//             sequelize.literal("0.00") // Fallback when there's no price
		//             ), 'minPrice'],
		//         ],
		//         required: true, 
		//     },

		//     where: { dealOfDay: true }, // Use a flag or logic to select the product

		//     group: ['product.productid', 'Product.name', 'Product.imageurl'],
		//     limit: 1
		// });


		const dealProduct = await Product.findAll({
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
				},
				{
					model: ProductRetailer,
					attributes: [],
					required: false, // This will use LEFT OUTER JOIN
				}
			],
			where: { dealOfDay: true }, // Use a flag or logic to select the product
			group: ['Product.ProductID', 'Product.name', 'Product.brand', 'Product.imageurl', 'Product.year', 'Category.name'], // Group by ProductID and CategoryId
		});
		// console.log(dealProduct);

		if (!dealProduct) {
			return res.status(404).send('No deal available today.');
		}

		// Calculate the discounted price
		const discountPercent = 20; // Define the discount
		// const discountedPrice = (dealProduct[0].minprice * (100 - discountPercent)) / 100; // original
		const discountedPrice = parseFloat(dealProduct[0].minprice);
		const originalPrice = parseFloat(dealProduct[0].minprice) + (parseFloat(dealProduct[0].minprice) * (discountPercent / 100));

		// console.log(discountedPrice, originalPrice);


		// Render the deal page with product details
		res.render('home', {
			title: "Deal of the Day",
			product: {
				name: dealProduct[0].name || '',
				imageurl: dealProduct[0].imageurl || '',
				// price: dealProduct['ProductRetailers.price'],
				// price: dealProduct[0].minprice,
				price: parseFloat(originalPrice) ?? 0.0,
				link: "/products/" + dealProduct[0]['Category.name'] + "/" + dealProduct[0].productid,
				discountedPrice: discountedPrice.toFixed(2) ?? 0.0,
				discountPercent
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Error fetching the deal of the day.');
	}
};
