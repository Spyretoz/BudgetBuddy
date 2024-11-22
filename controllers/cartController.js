const Product = require('../models/productModel');
const Retailer = require('../models/retailerModel');
const ProductRetailer = require('../models/productRetailerModel');


exports.addToCart = async (req, res) => {
	const { productId, retailerId, quantity } = req.body; // get them from productdetails page
	// console.log(productId, retailerId, quantity);

	try {
		// Fetch product details
		const product = await Product.findByPk(productId);
		const retailer = await Retailer.findByPk(retailerId);
		const productRetailer = await ProductRetailer.findOne({
			where: {
				ProductID: productId,
				RetailerID: retailerId
			}
		});

		// Validations
		if (!product || !retailer || !productRetailer) {
            return res.status(404).send({ message: "Product, Retailer or Price not found" });
        }


		const cart = req.session.cart;

		// Check if product from the same retailer is already in cart
		const existingItemIndex = cart.items.findIndex(
			item => item.productId === productId && item.retailerId === retailerId
		);

		const price = parseFloat(productRetailer.Price);

		if (existingItemIndex >= 0) {
			// Update quantity and total for existing product
			cart.items[existingItemIndex].quantity += parseInt(quantity);
			cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * price;
		} else {
			// Add new product to cart
			cart.items.push({
				productId: productId,
				productName: product.name, // Assuming `Name` field in Product
				retailerId: retailerId,
				retailerName: retailer.Name,
				price: price,
				quantity: parseInt(quantity),
				total: parseInt(quantity) * price,
			});
		}

		// Update cart totals
		cart.totalQuantity += parseInt(quantity);
		cart.totalPrice += parseInt(quantity) * price;

		//res.status(200).send({ message: "Product added to cart", cart });
		// res.status(200).send({ message: "Product added to cart"});
		// Redirect with a success message
        req.session.message = "Item added to cart successfully!";
		res.redirect(req.get("Referer") || "/"); // Safe redirect to the referring page or home
        // res.redirect("back"); // Redirects to the previous page
		// console.log(cart);
	} catch (err) {
		console.error(err);
		req.session.message = "Failed to add item to cart.";
        res.redirect("back"); // Redirects to the previous page
		// res.status(500).send({ message: "Server error", error: err.message });
	}
};


// Remove item from cart
exports.removeFromCart = (req, res) => {
	const productId = req.body.productId;

	// Filter out the product from cart
	req.session.cart = req.session.cart.filter(item => item.productId !== productId);

	res.status(200).send('Product removed from cart');
};

// Get cart contents
exports.viewCart = async (req, res) => {
	try {
		const cart = req.session.cart || [];
		console.log(cart);
		res.render('cart', { cart, title: "Your Cart" });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};