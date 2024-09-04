const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        res.status(200).render('contact', { title: "Contact Form" });
    } catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


module.exports = router;