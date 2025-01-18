const Product = require('../models/productModel');
const Retailer = require('../models/retailerModel');
const ProductRetailer = require('../models/productRetailerModel');

const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Category = require('../models/categoryModel');


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
		// const existingItemIndex = cart.items.findIndex(
		// 	item => item.productId === productId && item.retailerId === retailerId
		// );
		const existingItemIndex = cart.items.findIndex(item =>
			item.productId === Number(productId) &&
			item.retailerId === Number(retailerId)
		);

		const price = parseFloat(productRetailer.Price);

		if (existingItemIndex >= 0) {
			// Update quantity and total for existing product
			cart.items[existingItemIndex].quantity += parseInt(quantity);
			cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * price;
		} else {
			// Add new product to cart
			cart.items.push({
				productId: parseInt(productId),
				productName: product.name, // Assuming `Name` field in Product
				retailerId: parseInt(retailerId),
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
			const dbCart = await Cart.findOne({ where: { UserID: user.id } });

			// Check if item already exists in the database cart
			let dbCartItem = await CartItem.findOne({
				where: { CartID: dbCart.CartID, ProductID: productId, RetailerID: retailerId },
			});

			// console.log(dbCart);
			// console.log(dbCartItem);


			if (dbCartItem) {
				// Update quantity and total price if the item exists
				dbCartItem.Quantity = parseInt(dbCartItem.Quantity) + parseInt(quantity);
				dbCartItem.TotalPrice = parseFloat(dbCartItem.TotalPrice) + price * quantity;
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
			// console.log(price, quantity);

			dbCart.TotalQuantity = parseInt(dbCart.TotalQuantity) + parseInt(quantity);
			// dbCart.TotalPrice += price * quantity;
			dbCart.TotalPrice = parseFloat(dbCart.TotalPrice) + price * quantity;

			// console.log(dbCart.TotalPrice);

			await dbCart.save();
		}

		// Redirect with a success message
		req.session.message = "Item added to cart successfully!";
		res.redirect(req.get("Referer") || "/"); // Safe redirect to the referring page or home
	} catch (err) {
		console.error(err);
		req.session.message = "Failed to add item to cart.";
		res.redirect(req.get("Referer") || "/");
		// res.status(500).send({ message: "Server error", error: err.message });
	}
};



exports.removeFromCart = async (req, res) => {
	const { productId, retailerId } = req.body;

	try {
		const cart = req.session.cart;

		// Find the item in the session cart
		// const itemIndex = cart.items.findIndex(
		// 	(item) => item.productId === productId && item.retailerId === retailerId
		// );
		const itemIndex = cart.items.findIndex(item =>
			item.productId === Number(productId) &&
			item.retailerId === Number(retailerId)
		);

		if (itemIndex >= 0) {
			// Update session cart totals
			const item = cart.items[itemIndex];
			cart.totalQuantity -= item.quantity;
			cart.totalPrice -= item.total;

			// Remove the item from the session cart
			cart.items.splice(itemIndex, 1);

			// If the user is logged in, also update the database cart
			const user = req.session.user;
			if (user) {
				const dbCart = await Cart.findOne({ where: { UserID: user.id } });

				// console.log(dbCart);

				if (dbCart) {
					// Find the item in the database cart
					const dbCartItem = await CartItem.findOne({
						where: {
							CartID: dbCart.CartID,
							ProductID: productId,
							RetailerID: retailerId,
						},
					});


					if (dbCartItem) {
						// Update database cart totals
						dbCart.TotalQuantity = parseInt(dbCart.TotalQuantity) - parseInt(dbCartItem.Quantity);
						dbCart.TotalPrice = parseFloat(dbCart.TotalPrice) - parseFloat(dbCartItem.TotalPrice);

						// Delete the item from the database cart
						await dbCartItem.destroy();

						// Save updated totals in the database
						await dbCart.save();
					}
				}
			}

			return res.json({ success: true });
		} else {
			return res.status(404).json({ success: false, message: 'Item not found in cart' });
		}
	} catch (error) {
		console.error('Error removing item from cart:', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
};



exports.updateCart = async (req, res) => {
	const { productId, retailerId, quantityChange } = req.body;

	if (!req.session.cart) {
		return res.status(400).json({ success: false, message: "Cart not found." });
	}

	const cart = req.session.cart;
	// const itemIndex = cart.items.findIndex(
	// 	item =>
	// 		String(item.productId) === String(productId) &&
	// 		String(item.retailerId) === String(retailerId)
	// );
	const itemIndex = cart.items.findIndex(item =>
		item.productId === Number(productId) &&
		item.retailerId === Number(retailerId)
	);

	if (itemIndex === -1) {
		return res.status(404).json({ success: false, message: "Item not found in cart." });
	}

	const item = cart.items[itemIndex];

	// console.log(item);

	// Update the item's quantity
	item.quantity += quantityChange;

	// Validate quantity (e.g., prevent negative quantities)
	if (item.quantity <= 0) {
		// Remove item if quantity becomes zero or less
		cart.items.splice(itemIndex, 1);
	} else {
		// Update the item's total price
		// item.total = item.quantity * item.price;
		item.total = item.quantity * item.price;
	}

	// Update cart totals
	cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
	cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);

	// Update database if the user is logged in
	const user = req.session.user;
	// console.log(user);
	if (user) {
		try {
			const dbCart = await Cart.findOne({ where: { UserID: user.id } });

			if (!dbCart) {
				return res.status(400).json({ success: false, message: "Database cart not found." });
			}

			// console.log(dbCart.CartID, productId, retailerId);
			// Find CartItem in database
			const dbCartItem = await CartItem.findOne({
				where: { CartID: dbCart.CartID, ProductID: productId, RetailerID: retailerId },
			});

			// console.log(dbCartItem);
			

			if (!dbCartItem) {
				return res.status(404).json({ success: false, message: "Item not found in database cart." });
			}

			// Update or remove the item in the database
			if (item.quantity <= 0) {
				// Remove the item from the database
				await dbCartItem.destroy();
			} else {
				// Update the item's quantity and total price in the database
				// console.log(item.quantity);
				dbCartItem.Quantity = item.quantity;
				dbCartItem.TotalPrice = parseFloat(item.total);
				await dbCartItem.save();
			}

			// Update the cart totals in the database
			dbCart.TotalQuantity = cart.totalQuantity;
			dbCart.TotalPrice = parseFloat(cart.totalPrice);
			await dbCart.save();
		} catch (error) {
			console.error('Error updating database cart:', error);
			return res.status(500).json({ success: false, message: "Failed to update database cart." });
		}
	}

	// Respond with updated cart data
	res.json({
		success: true,
		updatedCart: cart,
	});
};



// Get cart contents
exports.viewCart = async (req, res) => {

	try {
		const cart = req.session.cart;
		// console.log(cart);

		// Load additional product details (e.g., image) for each item in the cart
		await Promise.all(
			cart.items.map(async (item) => {
				const product = await Product.findOne({

					include: {
						model: Category,
						attributes: ['name'],
					},
					where: { ProductID: item.productId },
				});

				// Update item with additional details
				item.productImage = product ? product.imageurl : '/images/default-product.png'; // Provide a default image fallback
				item.productName = product ? product.name : 'Unknown Product';
				item.productCategory = product.Category.name || '';

				// console.log("Category with name: " + product.Category.name);
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

		// console.log(cart.items);

		// Get unique retailer IDs
		const uniqueRetailers = [...new Set(cart.items.map(item => item.retailerId))];
		const shipPerRetailer = parseFloat(process.env.SHIPPING_COST_PER_RETAILER || 0);

    	const shippingCost = uniqueRetailers.length * shipPerRetailer;

		const totalWithShipping = cart.totalPrice + shippingCost;


		res.render('cart', { title: "Your Cart", cart: cartWithDetails, shippingCost, totalWithShipping });
	} catch (error) {
		console.error('Error loading cart:', error);
		res.status(500).send('An error occurred while loading the cart.');
	}
};