const Product = require('../models/productModel');
const ProductRetailer = require('../models/productRetailerModel');
const { Op } = require('sequelize');


// Controller function to handle AJAX search requests
exports.searchProducts = async (req, res) => {
    const query = req.query.query;
    console.log(query);


    try {
        // Sequelize query with 'ILIKE' for case-insensitive matching
        const products = await Product.findAll({

            include: [
				{
					model: ProductRetailer,
					attributes: [],
					required: false, // This will use LEFT OUTER JOIN

				}
			],
            where: {
                name: {
                    [Op.iLike]: `%${query}%` // Use ILIKE for case-insensitive search
                }
            },
            limit: 10 // Limit results for the drop-down
        });
        console.log(products);
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
            where: {
                name: {
                    [Op.iLike]: `%${query}%` // Use ILIKE for case-insensitive search
                }
            }
        });
        res.render('search', { products, query, title: query });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching search results', error });
    }
};