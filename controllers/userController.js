const User = require('../models/userModel');
const bcrypt = require('bcrypt');


exports.getProfile = async (req, res) => {
	try {
		const email = req.session.user.email;
		console.log(req.session.user);

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).send('User not logged in.');
		}

		res.status(200).render('profile', { user, title: "My Profile" } );
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id; // Assume user ID is stored in the session
        const { name, email, password, isretailer } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

		console.log(user);

		// Hash the password
		var hashedPassword;
		
		hashedPassword = await bcrypt.hash(password, 10);

        // Update user data
        user.name = name;
        user.email = email;
        user.password = hashedPassword;
        user.isretailer = isretailer === 'on'; // Convert checkbox to boolean

        await user.save();

		req.session.message = 'Profile updated successfully';
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


exports.getOrders = async (req, res) => {
	try {
		const email = req.session.user.email;	

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).send('User not logged in.');
		}

		res.status(200).render('orders', { title: "My Orders" } );
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