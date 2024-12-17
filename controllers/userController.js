const User = require('../models/userModel');


exports.getProfile = async (req, res) => {
	try {
		const email = req.session.user.email;	

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).send('User not logged in.');
		}

        res.render('profile', { title: "My Profile" } );
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};


exports.getOrders = async (req, res) => {
	try {
		const email = req.session.user.email;	

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).send('User not logged in.');
		}

        res.render('orders', { title: "My Orders" } );
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};


exports.getReviews = async (req, res) => {
	try {
		const email = req.session.user.email;	

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).send('User not logged in.');
		}
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};