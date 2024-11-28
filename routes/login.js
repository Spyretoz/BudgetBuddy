const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');


router.get('/login', loginController.login);

router.get('/signup', loginController.signup);

router.post('/logout', loginController.logout);

module.exports = router;