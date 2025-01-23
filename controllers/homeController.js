const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const ProductRetailer = require('../models/productRetailerModel');

exports.getHome = async (req, res) => {
    try {
        // Fetch a random or selected product for the deal
        // const dealProduct = await Product.findOne({
        //     // where: { isDealOfTheDay: true }, // Use a flag or logic to select the product
        //     attributes: ['ProductID', 'name', 'imageUrl'],
		// 	include:{
		// 		model: ProductRetailer,
		// 		attributes: ['price'],
		// 		required: true, 
		// 	},

		// 	limit: 1,

        // });
		const dealProduct = {
			ProductID: 2,
			name: 'S24 Ultra',
			imageUrl: "https://static.vecteezy.com/system/resources/previews/041/329/788/non_2x/samsung-galaxy-s24-ultra-titanium-blue-back-view-free-png.png",
			price: 1700.00
		};

		console.log(dealProduct);

        if (!dealProduct) {
            return res.status(404).send('No deal available today.');
        }

        // Calculate the discounted price
        const discountPercent = 20; // Define the discount
        const discountedPrice = (dealProduct.price * (100 - discountPercent)) / 100;

        // Render the deal page with product details
        res.render('home', {
            title: "Deal of the Day",
            product: {
                ...dealProduct,
                discountedPrice: discountedPrice.toFixed(2),
                discountPercent,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the deal of the day.');
    }
};
