const Product = require('../models/productModel'); // Adjust path based on your structure
const Cart = require('../models/cartModel');


exports.addToCart = async (req, res) => {

	if (!req.session.cart) {
		req.session.cart = [];
	}

	const { ProductID, RetailerID } = req.body;

	const Quantity = 1;
	// console.log(ProductID, RetailerID);


	if (!ProductID || !RetailerID) {
		return res.status(400).send('Missing product or retailer');
	}

	try {
		// Check if the cart entry already exists
		const cartSession = req.session.cart;

		const cartSessionItemExists = req.session.cart.find(item =>
			item.ProductID === parseInt(ProductID, 10) && item.RetailerID === parseInt(RetailerID, 10)
		);
		const cartItem = await Cart.findOne({ where: { ProductID, RetailerID } });

		console.log(cartSession, cartSessionItemExists);

		if (cartSessionItemExists) {
			
			cartSessionItemExists.quantity = cartSessionItemExists.quantity + 1;
		}
		else
		{
			req.session.cart.push({
				ProductID,
				RetailerID,
				Quantity: parseInt(Quantity, 10),
			});
		}
		

		if (cartItem) {
			// Update quantity if item exists
			cartItem.Quantity += 1;
			await cartItem.save();
		} else {
			// Create a new cart entry
			await Cart.create({ ProductID, RetailerID, Quantity });
		}

		res.status(200).send('Product added to cart');
	} catch (error) {
		console.error('Error adding to cart:', error);
		res.status(500).send('An error occurred');
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