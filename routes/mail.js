const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');


// Handle POST request to send an email
router.post('/', mailController.sendEmail);


module.exports = router;