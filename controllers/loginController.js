const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Adjust based on your User model path
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');


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

		// Fetch or create the user's cart
		const dbCart = await Cart.findOne({
			attributes: ['CartID', 'UserID', 'TotalQuantity', 'TotalPrice'],
			where: { UserID: user.UserID },
		});
		
		

		if (!dbCart) {
			const dbCart = await Cart.create({
				UserID: user.UserID,
				TotalQuantity: 0, // Initialize TotalQuantity to 0
				TotalPrice: 0.0,  // Initialize TotalPrice to 0.0
			});
		}


		// Merge session cart with database cart
		if (req.session.cart && req.session.cart.items.length > 0) {
			for (const sessionItem of req.session.cart.items) {
				const { productId, retailerId, quantity, price } = sessionItem;

				let dbItem = await CartItem.findOne({
					where: { CartID: dbCart.CartID, ProductID: productId, RetailerID: retailerId }
				});

				if (dbItem) {
					dbItem.Quantity += quantity;
					dbItem.TotalPrice = parseFloat(dbItem.TotalPrice) + (price * quantity);
					await dbItem.save();
				} else {
					await CartItem.create({
						CartID: dbCart.CartID,
						ProductID: productId,
						RetailerID: retailerId,
						Quantity: quantity,
						TotalPrice: price * quantity
					});
				}
			}

			// Update cart totals
			dbCart.TotalQuantity += req.session.cart.totalQuantity;
			dbCart.TotalPrice = parseFloat(dbCart.TotalPrice) + req.session.cart.totalPrice;
			await dbCart.save();

			req.session.cart = null; // Clear session cart after synchronization
		}
		
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
		res.redirect('/');
	});
};