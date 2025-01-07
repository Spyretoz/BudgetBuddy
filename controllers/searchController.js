const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');
const RetailerReviews = require('../models/retailerReviewsModel');



exports.getSearchProducts = async (req, res) => {
	try {

		const { option } = req.query; // Get user option: 'lowest-price' or 'best-reviews'
		const searchList = req.session.compare || [];

		console.log(option);

		const rows = await Product.findAll({
			raw: true,
			attributes: ['ProductId', 'name', 'imageurl'],
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
							include: [
								{
									model: RetailerReviews,
									attributes: ['Rating'],
									required: false,
								},
							],
						},
					],
				},
			],
		});

		// console.log(rows);

		// const results = products.map(product => ({
		// 	productName: product.name,
		// 	productImg: product.imageurl,
		// 	price: product['ProductRetailers.price'],
		// 	retailerName: product['ProductRetailers.Retailer.name'],
		// 	retailerRating: product['ProductRetailers.Retailer.RetailerReviews.Rating'],
		// }));

		// console.log(results);


		// 1. Group rows by productName (and imageurl)
		const productsMap = new Map();
		for (const row of rows) {
			const productId = row.productid;
			const productName = row.name;
			const productImg = row.imageurl;
	  
			const key = `${productId}::${productName}::${productImg}`;
			if (!productsMap.has(key)) {
				productsMap.set(key, []);
			}
			productsMap.get(key).push(row);
		}
	  
		// 2. For each product, figure out retailers + reviews
		const results = [];
		for (const [productKey, productRows] of productsMap.entries()) {
			// productKey = "iPhone 13 Mini::imageurl"
			const [pId, pName, pImg] = productKey.split('::');
	  
			// A map of retailers within THIS product
			// key = retailerName + price
			// value = { retailerName, price, ratings: [] }
			const retailersMap = new Map();
		
			for (const row of productRows) {
				const retailerName = row['ProductRetailers.Retailer.name'] || 'Unknown';
				const price = parseFloat(row['ProductRetailers.price']) || 0;
				const rating = parseFloat(row['ProductRetailers.Retailer.RetailerReviews.Rating']) || 0;
		
				// If there's no actual retailer in this row, skip
				if (!row['ProductRetailers.price'] && !row['ProductRetailers.Retailer.name']) {
					// Means no retailer at all
					continue;
				}
		
				const rKey = `${retailerName}::${price}`;
				if (!retailersMap.has(rKey)) {
					retailersMap.set(rKey, {
						retailerName,
						price,
						ratings: [],
					});
				}
				retailersMap.get(rKey).ratings.push(rating);
			}
		
			// 3. Compute average rating for each retailer entry
			const retailerEntries = [...retailersMap.values()].map(r => {
				if (r.ratings.length === 0) {
					r.averageRating = 0; 
				} else {
					const sum = r.ratings.reduce((acc, val) => acc + val, 0);
					r.averageRating = sum / r.ratings.length;
				}
				return r;
			});
		
			// 4. Choose the "best" retailer for this product
			let chosen;
			if (retailerEntries.length === 0) {
				chosen = { retailerName: 'No retailer found', price: 0, averageRating: 0 };
			} else if (option === 'best-reviews') {
				// Highest average rating
				chosen = retailerEntries.reduce((best, current) =>
					current.averageRating > best.averageRating ? current : best
				);
			} else {
				// Default = 'lowest-price'
				chosen = retailerEntries.reduce((lowest, current) =>
					current.price < lowest.price ? current : lowest
				);
			}
		
			results.push({
				productid: pId,
				productName: pName,
				productImg: pImg,
				retailerName: chosen.retailerName,
				price: chosen.price,
				averageRating: chosen.averageRating.toFixed(1),
			});
		}
	  
		// 5. Compute total price across all products
		const totalPrice = results.reduce((acc, item) => acc + item.price, 0);

		// console.log(results, totalPrice);


		// If the request is AJAX (fetch, XHR), return JSON
		if (req.xhr || req.headers.accept.indexOf('json') > -1) {
			return res.json({ results, totalPrice });
		}
	  
		
		res.status(200).render('search', { title: "Advanced Search", results, totalPrice });
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

	res.json({ message: 'Product added to search list', compareList: req.session.compare, success: true });
};





exports.delSearchProduct = async (req, res) => {

	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	const productIdNum = parseInt(productId, 10);
	req.session.compare = req.session.compare.filter(id => id !== productIdNum);

	// req.session.compare = req.session.compare.filter(id => id !== productId);
	res.json({ message: 'Product removed from comparison list', compareList: req.session.compare, success: true });
};