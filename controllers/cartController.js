const Product = require('../models/productModel'); // Adjust path based on your structure

// Add item to cart
exports.addToCart = async (req, res) => {
	const productId = req.body.productid;
	const quantity = parseInt(req.body.quantity) || 1;

	// Fetch product details
	const product = await Product.findByPk(productId);
	if (!product) {
		return res.status(404).send('Product not found');
	}

	// Initialize cart if it doesn't exist
	if (!req.session.cart) {
		req.session.cart = [];
	}

	// Find if product is already in the cart
	const cartItemIndex = req.session.cart.findIndex(item => item.productId === productId);
	if (cartItemIndex > -1) {
		// If product exists in cart, update quantity
		req.session.cart[cartItemIndex].quantity += quantity;
	} else {
	// Add new product to cart
		req.session.cart.push({
			productId: product.productid,
			name: product.name,
			price: product.price,
			quantity: quantity
		});
	}

	res.status(200).send('Product added to cart');
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
		res.render('cart', { cart, title: "Your Cart" });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};