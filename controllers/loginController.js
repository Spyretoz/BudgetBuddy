exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
	
		const user = await User.findOne({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).send('Invalid email or password.');
		}
	
		// Save user data in session
		req.session.user = { id: user.id, name: user.name, email: user.email };
	
		res.redirect('/');
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
	}
};


exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
	
		const user = await User.findOne({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).send('Invalid email or password.');
		}
	
		// Save user data in session
		req.session.user = { id: user.id, name: user.name, email: user.email };
	
		res.redirect('/');
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).send('An error occurred.');
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