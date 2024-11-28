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


// Save session cart to database on login
exports.saveCartToDatabase = async (req, res) => {
    if (!req.session.cart || !req.user) {
        return res.status(400).send({ message: "No cart to save or user not logged in" });
    }

    const { cart } = req.session;
    const userId = req.user.id;

    try {
        let userCart = await Cart.findOne({ where: { UserID: userId } });

        if (!userCart) {
            userCart = await Cart.create({
                UserID: userId,
                TotalQuantity: cart.totalQuantity,
                TotalPrice: cart.totalPrice,
            });

            for (const item of cart.items) {
                await CartItem.create({
                    CartID: userCart.CartID,
                    ProductID: item.productId,
                    RetailerID: item.retailerId,
                    Quantity: item.quantity,
                    TotalPrice: item.total,
                });
            }
        } else {
            const existingItems = await CartItem.findAll({ where: { CartID: userCart.CartID } });

            for (const sessionItem of cart.items) {
                const existingItem = existingItems.find(item => 
                    item.ProductID === sessionItem.productId && item.RetailerID === sessionItem.retailerId
                );

                if (existingItem) {
                    existingItem.Quantity += sessionItem.quantity;
                    existingItem.TotalPrice += sessionItem.total;
                    await existingItem.save();
                } else {
                    await CartItem.create({
                        CartID: userCart.CartID,
                        ProductID: sessionItem.productId,
                        RetailerID: sessionItem.retailerId,
                        Quantity: sessionItem.quantity,
                        TotalPrice: sessionItem.total,
                    });
                }
            }

            userCart.TotalQuantity += cart.totalQuantity;
            userCart.TotalPrice += cart.totalPrice;
            await userCart.save();
        }

        req.session.cart = null;

        res.status(200).send({ message: "Cart saved to database successfully" });
    } catch (err) {
        res.status(500).send({ message: "Server error", error: err.message });
    }
};




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