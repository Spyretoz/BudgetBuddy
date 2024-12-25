const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');


router.get('/', loginController.login);

router.post('/', loginController.loginact);

router.get('/signup', loginController.signup);

router.post('/signup', loginController.signupact);

router.post('/logout', loginController.logout);


module.exports = router;