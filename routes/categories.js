const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('categories', { title: "Choose category" });
});


module.exports = router;