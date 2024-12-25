exports.getContact = async (req, res) => {
	try {
		res.status(200).render('contact', { title: "Contact Form" });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};