const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


router.get('/', contactController.getContact);

// Handle POST request to send an email
router.post('/send-email', contactController.sendEmail);


module.exports = router;