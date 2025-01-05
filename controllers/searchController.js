exports.getSearchProducts = async (req, res) => {
	try {

		res.json({ compareList: req.session.compare });
		
		res.status(200).render('search', { title: "Advanced Search" });
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
};



exports.addSearchProduct = async (req, res) => {
	const { productId } = req.body;

	if (!productId) {
		return res.status(400).json({ error: 'Product ID is required' });
	}

	// Check if the product is already in the compare list
	if (req.session.compare.includes(productId)) {
		return res.status(400).json({ error: 'Product is already in the comparison list' });
	}

	// Optional: Limit the number of products to compare
	if (req.session.compare.length >= 5) {
		return res.status(400).json({ error: 'You can only compare up to 5 products' });
	}

	// Add product to the compare list
	req.session.compare.push(productId);

	res.json({ message: 'Product added to comparison list', compareList: req.session.compare });
};





exports.delSearchProduct = async (req, res) => {

	const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    req.session.compare = req.session.compare.filter(id => id !== productId);

    res.json({ message: 'Product removed from comparison list', compareList: req.session.compare });
};