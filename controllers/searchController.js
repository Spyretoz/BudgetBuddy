const sequelize = require('../config/database'); // Import the Sequelize instance

const Product = require('../models/productModel');
const ProductRetailer = require('../models/productRetailerModel');
const Retailer = require('../models/retailerModel');
const RetailerReviews = require('../models/retailerReviewsModel');

const Category = require('../models/categoryModel');


exports.getSearchProducts = async (req, res) => {
	try {

		const { option } = req.query; // Get user option: 'lowest-price' or 'best-reviews'
		const searchList = req.session.compare.items || [];

		const shipCost = parseFloat(process.env.SHIPPING_COST_PER_RETAILER);

		// console.log(option);

		const products = await Product.findAll({
			raw: true,
			attributes: ['ProductId', 'name', 'imageurl'],
			where: { ProductId: searchList },
			include: [
				{
					model: Category,
					attributes: ['name']
				},
				{
					model: ProductRetailer,
					attributes: ['price'],
					required: false,
					include: [
						{
							model: Retailer,
							attributes: ['name',
								[
									sequelize.fn( 'ROUND',
										sequelize.fn('AVG', sequelize.col('ProductRetailers->Retailer->RetailerReviews.Rating'))
									, 1),
									'avgRating'
								],
							],
							required: false,
							include: [
								{
									model: RetailerReviews,
									attributes: [],
									required: false
								}
							]
						}
					]
				}
			],
			group: [
				// Group by product columns
				'Product.productid',
				'Product.name',
				'Product.imageurl',

				// Group by categoty columns
				'Category.name',
			
				// Group by ProductRetailer columns + PK 
				'ProductRetailers.Price',
			
				// Group by Retailer columns + PK
				'ProductRetailers->Retailer.RetailerId',
				'ProductRetailers->Retailer.Name'
			]
		});

		// console.log(products);



		const productsMap = new Map();
		products.forEach(product => {
			const productId = product.productid;
			const productName = product.name;
			const productImg = product.imageurl;
			const categoryName = product['Category.name'];

			const key = `${productId}::${productName}::${productImg}::${categoryName}`;

			if (!productsMap.has(key)) {
				productsMap.set(key, []);
			}
			productsMap.get(key).push(product); // fill products map
		});

		const results = [];
		let bestTotalCost = Infinity;
		let bestCombination = null;

		// Prepare product data grouped by retailer
		const retailerProductCosts = new Map(); // { retailerName -> { productId -> { price, avgRating } } }

		productsMap.forEach((productRows, productKey) => {
			const [productId] = productKey.split('::');
			productRows.forEach(row => {
				const retailerName = row['ProductRetailers.Retailer.name'];
				const price = parseFloat(row['ProductRetailers.price'] || 0);
				const avgRating = parseFloat(row['ProductRetailers.Retailer.avgRating'] || 0);
				if (!retailerName || price === 0) return;

				if (!retailerProductCosts.has(retailerName)) {
					retailerProductCosts.set(retailerName, new Map());
				}
				retailerProductCosts.get(retailerName).set(productId, { price, avgRating });
			});
		});

		// Evaluate all possible combinations of retailers
		const productIds = Array.from(productsMap.keys()).map(key => key.split('::')[0]);

		function calculateCost(retailerSelection, option) {
			let totalCost = 0;
			const usedRetailers = new Set();
			let avgRatingsSum = 0; // Sum of ratings to compare combinations for best-reviews
			let productCount = 0;

			productIds.forEach(productId => {
				const selectedRetailer = retailerSelection[productId];
				const retailerData = retailerProductCosts.get(selectedRetailer)?.get(productId);

				if (!retailerData) {
					throw new Error(`Missing data for product ${productId} with retailer ${selectedRetailer}`);
				}

				totalCost += retailerData.price;
				avgRatingsSum += retailerData.avgRating;
				productCount += 1;
				usedRetailers.add(selectedRetailer);
			});

			totalCost += usedRetailers.size * shipCost; // Add shipping cost for unique retailers

			return {
				totalCost,
				avgRating: avgRatingsSum / productCount, // Average rating for the combination
				usedRetailers,
			};
		}

		// Generate combinations of retailers
		function generateCombinations(productIds, retailersPerProduct) {
			if (productIds.length === 0) return [{}];
			const [currentProductId, ...remainingProductIds] = productIds;
			const combinations = [];

			(retailersPerProduct[currentProductId] || []).forEach(retailer => {
				const subCombinations = generateCombinations(remainingProductIds, retailersPerProduct);
				subCombinations.forEach(subCombination => {
					combinations.push({ ...subCombination, [currentProductId]: retailer });
				});
			});

			return combinations;
		}

		// Collect all possible retailers for each product
		const retailersPerProduct = {};
		productsMap.forEach((productRows, productKey) => {
			const [productId] = productKey.split('::');
			retailersPerProduct[productId] = productRows.map(row => row['ProductRetailers.Retailer.name']);
		});

		const allCombinations = generateCombinations(productIds, retailersPerProduct);

		// Evaluate each combination to find the best one
		allCombinations.forEach(combination => {
			const { totalCost, avgRating, usedRetailers } = calculateCost(combination, option);

			if (option === 'best-reviews') {
				// Prioritize combinations with higher avgRating, then lower totalCost
				if (
					avgRating > (bestCombination?.avgRating || 0) ||
					(avgRating === (bestCombination?.avgRating || 0) && totalCost < bestTotalCost)
				) {
					bestTotalCost = totalCost;
					bestCombination = { combination, totalCost, avgRating, usedRetailers };
				}
			} else {
				// Default: lowest-price
				if (totalCost < bestTotalCost) {
					bestTotalCost = totalCost;
					bestCombination = { combination, totalCost, avgRating, usedRetailers };
				}
			}
		});

		// Populate results based on the best combination
		if (bestCombination) {
			productsMap.forEach((productRows, productKey) => {
				const [productId, productName, productImg, categoryName] = productKey.split('::');
				const chosenRetailer = bestCombination.combination[productId];
				const chosenData = retailerProductCosts.get(chosenRetailer).get(productId);

				results.push({
					productid: productId,
					productName,
					productImg,
					categoryName,
					retailerName: chosenRetailer,
					price: chosenData.price,
					averageRating: chosenData.avgRating,
				});
			});
		}

		const groupedResults = results.reduce((acc, product) => {
			const retailer = product.retailerName;
			if (!acc[retailer]) {
				acc[retailer] = [];
			}
			acc[retailer].push(product);
			return acc;
		}, {});

		res.status(200).render('search', {
			title: "Advanced Search",
			results: results || [], // Default to an empty array if results is null or undefined
			groupedResults: groupedResults || {}, // Default to an empty object if groupedResults is null or undefined
			totalPrice: 
				(bestTotalCost ?? 0) - ((bestCombination?.usedRetailers?.size ?? 0.0) * (shipCost ?? 0.0)),
			shippingCost: 
				(bestCombination?.usedRetailers?.size ?? 0.0) * (shipCost ?? 0.0),
			totalWithShipping: bestTotalCost ?? 0,
			selectedOption: option ?? "default"
		});
		

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};



exports.addSearchProduct = async (req, res) => {
	const { productId } = req.body;


	if (!req.session.compare) {
		req.session.compare = { items: [], totalItems: 0 };
	}

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	// Check if the product is already in the compare list
	if (req.session.compare.items.includes(productId)) {
		return res.status(400).json({ error: 'Product is already in the search list', alreadyInList: true });
	}

	// Optional: Limit the number of products to compare
	if (req.session.compare.totalItems >= 5) {
		return res.status(400).json({ error: 'You can only compare up to 5 products', moreThan: true });
	}

	// Add product to the compare list
	req.session.compare.items.push(productId);
	req.session.compare.totalItems += 1;

	// console.log(req.session.compare);

	
	res.json({ 
		message: 'Product added to search list', 
		compareList: req.session.compare.items, 
		totalItems: req.session.compare.totalItems, 
		success: true 
	});
};





exports.delSearchProduct = async (req, res) => {

	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	const productIdNum = parseInt(productId, 10);
	req.session.compare.items = req.session.compare.items.filter(id => id !== productIdNum);
	req.session.compare.totalItems -= 1;

	res.json({ 
        message: 'Product removed from comparison list', 
        compareList: req.session.compare.items, 
        totalItems: req.session.compare.totalItems, 
        success: true 
    });
};