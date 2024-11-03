const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session');

// Init app
const app = express();


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; // for connection with secure db



app.use(session({
	secret: 'your-secret-key', // Replace with a secure key
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false } // Set to true if using HTTPS
}));






// For parsing application/json
app.use(express.json());


// View engine setup
app.set('view engine', 'ejs');


// CSS Files Path
app.use('/assets', express.static('style'));
app.use(express.static(path.join(__dirname, './views/style/')));


// Set routes
const home = require('./routes/home.js');
app.use('/', home);

const categories = require('./routes/categories.js');
app.use('/', categories);

const products = require('./routes/products.js');
app.use('/categories', products);


const insertproduct = require('./routes/insertproduct.js');
app.use('/insertnewproduct', insertproduct);

const cart = require('./routes/cart.js');
app.use('/cart', cart);



const contact = require('./routes/contact.js');
app.use('/contact', contact);

const mail = require('./routes/mail.js');
app.use('/send-email', mail);



// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
})


var port = 8081;
var server = app.listen(port, function () {
	// var host = server.address().address;
	// var port = server.address().port;
	console.log(`Server is listening at http://localhost:${port}`);
});
