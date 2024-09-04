const express = require('express');
const router = express.Router();
const client = require('../config/database.js');



router.get('/:categoryid', async (req, res) => {

	try {
		const categoryID = req.params.categoryid;
		res.status(200).render('products', { title: categoryID });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}

});


router.get('/:categoryid/products', async (req, res) => {

	try {
		const categoryID = req.params.categoryid;
		const query = "SELECT PRODUCTS.productid, PRODUCTS.name, PRODUCTS.imageurl, COALESCE(MIN(PRODUCTRETAILERS.PRICE), 0.00) AS PRICE FROM PRODUCTS LEFT OUTER JOIN CATEGORIES ON CATEGORIES.categoryID = PRODUCTS.categoryID LEFT OUTER JOIN PRODUCTRETAILERS ON PRODUCTRETAILERS.productID = PRODUCTS.productID WHERE CATEGORIES.categoryname = $1 GROUP BY PRODUCTS.productid, PRODUCTS.name, PRODUCTS.imageurl";
		
		const values = [categoryID];
		const products = await client.query(query, values);

		//console.log(products.rows);
		res.json(products.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});


router.get('/:categoryid/:productid/:productname', async (req, res) => {

	try {
		const productname = req.params.productname;
		res.status(200).render('productdetails', { title: productname });

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

router.get('/:categoryid/:productid/:productname/info', async (req, res) => {

	try {

		const productID = req.params.productid;
		const query = 'SELECT PRODUCTS.productid, PRODUCTS.name as PRDNAME, PRODUCTS.DESCRIPTION, PRODUCTS.name, PRODUCTS.imageurl AS PRODIMG, PRODUCTRETAILERS.PRICE, PRODUCTRETAILERS.PRODUCTLINK, RETAILERS.NAME AS RETAILNAME, RETAILERS.website, RETAILERS.location, RETAILERS.IMAGEURL AS RETAILERIMG FROM PRODUCTS LEFT OUTER JOIN PRODUCTRETAILERS ON PRODUCTRETAILERS.PRODUCTID = PRODUCTS.PRODUCTID LEFT OUTER JOIN RETAILERS ON RETAILERS.RETAILERID = PRODUCTRETAILERS.RETAILERID WHERE PRODUCTS.productid = $1 ORDER BY PRICE';
		
		const value = [productID];
		const productinfo = await client.query(query, value);

		console.log(productinfo.rows);
		res.json(productinfo.rows);

	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});



module.exports = router;