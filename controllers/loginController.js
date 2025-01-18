const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Adjust based on your User model path
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');

const Product = require('../models/productModel');
const Retailer = require('../models/retailerModel');



exports.login = async (req, res) => {
	try {
		const errors = [];
		res.render('login', { title: "Login", errors } );
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};

exports.loginact = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Collect errors in an array
		const errors = [];

		// console.log(req.session.cart.items);

		const user = await User.findOne({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			errors.push('Email or password is incorrect.');
		}

		// If errors exist
		if (errors.length > 0) {
			return res.status(400).render('login', { title: "Login", errors });
		}

		// Save user data in session
		req.session.user = { id: user.UserID, name: user.name, email: user.email };

		// Fetch or create the user's database cart
		let dbCart = await Cart.findOne({ where: { UserID: user.UserID } });

		if (!dbCart) {
			// Create a new cart in the database if none exists
			dbCart = await Cart.create({
				UserID: user.UserID,
				TotalQuantity: 0,
				TotalPrice: 0,
			});
		}

		// console.log(dbCart);

		const sessionCart = req.session.cart;
		// Merge session cart into database cart
		if (sessionCart.items.length > 0) {
			for (const sessionItem of sessionCart.items) {
				const { productId, retailerId, quantity, price } = sessionItem;

				// Check if item exists in the database cart
				let dbItem = await CartItem.findOne({
					where: { CartID: dbCart.CartID, ProductID: productId, RetailerID: retailerId },
				});

				// console.log(dbItem);

				if (dbItem) {
					// Update the quantity and price if item exists
					dbItem.Quantity = parseInt(dbItem.Quantity) + parseInt(quantity);
					dbItem.TotalPrice = parseFloat(dbItem.TotalPrice) + parseFloat(price) * quantity;
					await dbItem.save();
				} else {
					// Add new item to the database cart
					await CartItem.create({
						CartID: dbCart.CartID,
						ProductID: productId,
						RetailerID: retailerId,
						Quantity: quantity,
						TotalPrice: price * quantity,
					});
				}
			}

			// Update the database cart totals
			dbCart.TotalQuantity += sessionCart.totalQuantity;
			dbCart.TotalPrice = parseFloat(dbCart.TotalPrice) + parseFloat(sessionCart.totalPrice);
			await dbCart.save();
		}


		// Transfer database cart items to session cart
		const dbCartItems = await CartItem.findAll({
			raw: true,
			where: { CartID: dbCart.CartID },
			include: [
				{ model: Product, attributes: ['Name'] }, // Product name
				{ model: Retailer, attributes: ['Name'] }, // Retailer name
			]
		});

		console.log(dbCartItems);

		if(dbCartItems) {
			req.session.cart.items = dbCartItems.map((item) => ({
				productId: item.productid,
				productName: item['Product.Name'],
				retailerId: item.retailerid,
				retailerName: item['Retailer.Name'],
				price: parseFloat(item.totalprice) / parseInt(item.quantity),
				quantity: parseInt(item.quantity),
				total: parseFloat(item.totalprice),
			}));

			// dbCartItems.forEach(cartItem => {
			// 	// console.log(cartItem);
			// 	req.session.cart.items.push({
			// 		productId: cartItem.productid,
			// 		productName: cartItem['Product.Name'],
			// 		retailerId: cartItem.retailerid,
			// 		retailerName: cartItem['Retailer.Name'],
			// 		price: cartItem.totalprice / parseInt(cartItem.quantity),
			// 		quantity: parseInt(cartItem.quantity),
			// 		total: parseFloat(cartItem.totalprice),
			// 	});
			// });

			
		}

		req.session.cart.totalQuantity = dbCart.TotalQuantity;
		req.session.cart.totalPrice = parseFloat(dbCart.TotalPrice);

		console.log("Cart items: " + JSON.stringify(req.session.cart));

		// console.log("Cart total quantity: " + req.session.cart.totalQuantity);
		// console.log("Cart total totalPrice: " + req.session.cart.TotalPrice);
		
		// console.log(req.session.cart);
		// console.log(req.session.cart.items);

		res.redirect('/');
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};



// Signup Controller
exports.signup = async (req, res) => {
	try {
		const errors = [];
		res.render('signup', { title: "Sign Up", errors } );
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};


exports.signupact = async (req, res) => {
	try {
		const { name, email, password, confirmPassword } = req.body;

		// Collect errors in an array
		const errors = [];


		// Validate input
		if (!name || !email || !password || !confirmPassword) {
			errors.push('All fields are required.');
		}
		if (password !== confirmPassword) {
			errors.push('Passwords do not match.');
		}
  
		// Check if user already exists
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			errors.push('Email is already registered.');
		}

		// If errors exist, render them
		if (errors.length > 0) {
			return res.status(400).render('signup', { title: "Sign Up Problem", errors });
		}
  
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);
	
		// Save new user
		await User.create({
			name,
			email,
			password: hashedPassword,
		});

		const user = await User.findOne({ where: { email } });
		// console.log(user);

		await Cart.create({
			UserID: user.UserID,
			TotalQuantity: 0,
			TotalPrice: 0,
		});
  
		// Redirect to login page after successful signup
		res.redirect('/login');
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).render('signup', { title: "Sign Up Problem", error: 'An error occurred during signup.' });
	}
};


exports.logout = (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error during logout:', err);
			return res.status(500).send('Logout failed.');
		}
		// Redirect back to the previous page, or fallback to home if no referer
		const previousPage = req.get('Referer') || '/';
		res.redirect(previousPage);
	});
};