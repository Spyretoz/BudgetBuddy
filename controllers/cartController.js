const Product = require('../models/productModel');
const Retailer = require('../models/retailerModel');
const ProductRetailer = require('../models/productRetailerModel');

const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');


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

		const user = req.session.user;

		if (user) {
			const dbCart = await Cart.findOne({
				attributes: ['CartID', 'UserID', 'TotalQuantity', 'TotalPrice'], // Specify fields for Cart
				where: { UserID: user.id },
				
			});

			console.log(dbCart);

			// if (!dbCart) {
			// 	// Create a new cart for the user if none exists
			// 	dbCart = await Cart.create({
			// 		UserID: user.id,
			// 		TotalQuantity: 0,
			// 		TotalPrice: 0.0,
			// 	});
			// }

			// Check if item already exists in the database cart
			let dbCartItem = await CartItem.findOne({
				where: {
					CartID: dbCart.CartID,
					ProductID: productId,
					RetailerID: retailerId,
				},
			});

			if (dbCartItem) {
				// Update quantity and total price if the item exists
				dbCartItem.Quantity += quantity;
				dbCartItem.TotalPrice += price * quantity;
				await dbCartItem.save();
			} else {
				// Add new item to CartItem
				await CartItem.create({
					CartID: dbCart.CartID,
					ProductID: productId,
					RetailerID: retailerId,
					Quantity: quantity,
					TotalPrice: price * quantity,
				});
			}

			// Update cart totals in the database
			dbCart.TotalQuantity += quantity;
			dbCart.TotalPrice += price * quantity;
			await dbCart.save();
		}

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
		res.redirect(req.get("Referer") || "/");
		// res.status(500).send({ message: "Server error", error: err.message });
	}
};

exports.removeFromCart = (req, res) => {
	const { productId, retailerId } = req.body;

	const cart = req.session.cart;
	const itemIndex = cart.items.findIndex(
		item => item.productId === productId && item.retailerId === retailerId
	);

	if (itemIndex >= 0) {
		const item = cart.items[itemIndex];
		cart.totalQuantity -= item.quantity;
		cart.totalPrice -= item.total;

		cart.items.splice(itemIndex, 1);

		res.json({ success: true });
	} else {
		res.status(404).json({ success: false, message: 'Item not found in cart' });
	}
};


exports.updateCart = async (req, res) => {
	const { productId, retailerId, quantityChange } = req.body;

	if (!req.session.cart) {
		return res.status(400).json({ success: false, message: "Cart not found." });
	}

	const cart = req.session.cart;
	const itemIndex = cart.items.findIndex(
		item => item.productId === productId && item.retailerId === retailerId
	);

	if (itemIndex === -1) {
		return res.status(404).json({ success: false, message: "Item not found in cart." });
	}

	const item = cart.items[itemIndex];

	// Update the item's quantity
	item.quantity += quantityChange;

	// Validate quantity (e.g., prevent negative quantities)
	if (item.quantity <= 0) {
		// Remove item if quantity becomes zero or less
		cart.items.splice(itemIndex, 1);
	} else {
		// Update the item's total price
		item.total = item.quantity * item.price;
	}

	// Update cart totals
	cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
	cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);

	// Respond with updated cart data
	res.json({
		success: true,
		updatedCart: cart,
	});
};




// exports.saveCartToDatabase = async (req, res) => {
// 	try {
// 		const user = req.session.user;

// 		if (!user) {
// 			return res.status(401).json({ message: 'User is not logged in.' });
// 		}

// 		const sessionCart = req.session.cart;

// 		if (!sessionCart || sessionCart.items.length === 0) {
// 			return res.status(400).json({ message: 'No items in the session cart to save.' });
// 		}

// 		// Find the user's cart in the database
// 		let dbCart = await Cart.findOne({ where: { UserID: user.UserID } });

// 		// If no cart exists for the user, create a new one
// 		if (!dbCart) {
// 			dbCart = await Cart.create({
// 				UserID: user.UserID,
// 				TotalQuantity: 0,
// 				TotalPrice: 0.0,
// 			});
// 		}

// 		// Clear existing CartItems for this cart
// 		await CartItem.destroy({ where: { CartID: dbCart.CartID } });

// 		// Add CartItems from session cart to the database cart
// 		const cartItemsToInsert = sessionCart.items.map(item => ({
// 			CartID: dbCart.CartID,
// 			ProductID: item.productId,
// 			RetailerID: item.retailerId,
// 			Quantity: item.quantity,
// 			TotalPrice: item.price * item.quantity, // Calculate total price for the item
// 		}));

// 		await CartItem.bulkCreate(cartItemsToInsert);

// 		// Update the cart's total quantity and total price
// 		const totalQuantity = sessionCart.items.reduce((sum, item) => sum + item.quantity, 0);
// 		const totalPrice = sessionCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

// 		dbCart.TotalQuantity = totalQuantity;
// 		dbCart.TotalPrice = totalPrice;
// 		await dbCart.save();

// 		return res.status(200).json({ message: 'Cart saved to database successfully.' });
// 	} catch (error) {
// 		console.error('Error saving cart to database:', error);
// 		return res.status(500).json({ message: 'An error occurred while saving the cart.' });
// 	}
// };





// Get cart contents
exports.viewCart = async (req, res) => {

	try {
		const cart = req.session.cart;

		// Load additional product details (e.g., image) for each item in the cart
		await Promise.all(
			cart.items.map(async (item) => {
				const product = await Product.findOne({
					where: { ProductID: item.productId },
				});

				// Update item with additional details
				item.productImage = product ? product.imageurl : '/images/default-product.png'; // Provide a default image fallback
				item.productName = product ? product.name : 'Unknown Product';
			})
		);


		for (const item of cart.items) {
			// Fetch the lowest price for the same product from other retailers
			const lowerPriceOffer = await ProductRetailer.findOne({
				where: {
					productId: item.productId
				},
				include: [
					{
						model: Retailer, // Join with the Retailer model to get the retailer name
						attributes: ['Name'], // Only fetch the name
					},
				],
				order: [['price', 'ASC']], // Get the lowest price
			});

	
			// Check if a lower price offer exists
			if (lowerPriceOffer && lowerPriceOffer.Price < item.price) {
				// If the current item's price is higher than the lowest price, add the lower price warning
				item.lowerPrice = lowerPriceOffer.Price;
				item.lowerPriceRetailerName = lowerPriceOffer.Retailer.Name;
			}
			else {
				// Remove the warning if no lower price exists
				item.lowerPrice = null;
				item.lowerPriceRetailerName = null;
			}
		}

		const cartWithDetails = {
			totalQuantity: cart.totalQuantity,
			totalPrice: cart.totalPrice,
			items: cart.items
		};

		res.render('cart', { title: "Your Cart", cart: cartWithDetails });
	} catch (error) {
		console.error('Error loading cart:', error);
		res.status(500).send('An error occurred while loading the cart.');
	}
};