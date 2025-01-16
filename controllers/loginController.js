const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Adjust based on your User model path
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');

const Product = require('../models/productModel');
const Retailer = require('../models/retailerModel');



exports.login = async (req, res) => {
	try { 
		res.render('login', { title: "Login" } );
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};

exports.loginact = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).send('Invalid email or password.');
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

		// Transfer database cart items to session cart
		const dbCartItems = await CartItem.findAll({
			raw: true,
			where: { CartID: dbCart.CartID },
			include: [
                { model: Product, attributes: ['Name'] }, // Product name
                { model: Retailer, attributes: ['Name'] }, // Retailer name
            ]
		});

		// console.log(dbCartItems);



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

		if(dbCartItems) {
			// console.log("Got items from db");
			// req.session.cart.items = dbCartItems.map((item) => ({
			// 	productId: item.productid,
			// 	productName: item['Product.Name'],
			// 	retailerId: item.retailerid,
			// 	retailerName: item['Retailer.Name'],
			// 	price: parseFloat(item.totalprice),
			// 	quantity: parseInt(item.quantity),
			// 	total: parseFloat(item.totalprice)*item.quantity,
			// }));

			dbCartItems.forEach(cartItem => {
				// console.log(cartItem);
				req.session.cart.items.push({
					productId: cartItem.productid,
					productName: cartItem['Product.Name'],
					retailerId: cartItem.retailerid,
					retailerName: cartItem['Retailer.Name'],
					price: cartItem.totalprice,
					quantity: parseInt(cartItem.quantity),
					total: parseInt(cartItem.quantity) * cartItem.totalprice,
				});
			});

			req.session.cart.totalQuantity = dbCart.TotalQuantity;
			req.session.cart.totalPrice = parseFloat(dbCart.TotalPrice);
		}
		
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
		res.render('signup', { title: "Sign Up" } );
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};


exports.signupact = async (req, res) => {
	try {
		const { name, email, password, confirmPassword } = req.body;
  
		// Validate input
		if (!name || !email || !password || !confirmPassword) {
			return res.render('signup', { error: 'All fields are required.' });
		}
		if (password !== confirmPassword) {
			return res.render('signup', { error: 'Passwords do not match.' });
		}
  
		// Check if user already exists
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.render('signup', { error: 'Email is already registered.' });
		}
  
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);
	
		// Save new user
		await User.create({
			name,
			email,
			password: hashedPassword,
		});
  
		// Redirect to login page after successful signup
		res.redirect('/login');
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).render('signup', { error: 'An error occurred during signup.' });
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