const express = require('express');
const path = require('path');
const session = require('express-session');

// Init app
const app = express();


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; // for connection with secure db



app.use(
	session({
		secret: 'your-secret-key', // Used to sign session cookies (keep it secret!)
		resave: false,             // Prevents resaving session if it hasn't changed
		saveUninitialized: true,   // Save sessions even if they are new and unmodified
		cookie: {
			secure: false,           // Set to true if using HTTPS
			maxAge: 1000 * 60 * 60,  // Session expiration in milliseconds (1 hour)
		}
	})
);

const auth = module.exports = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	next();
};


app.use((req, res, next) => {
	if (!req.session.compare) {
		req.session.compare = {
			items: [],
			totalItems: 0
		};
	}
	next();
});


app.use((req, res, next) => {
	// Initialize cart if it doesn't exist in the session
	if (!req.session.cart) {
		req.session.cart = {
			items: [],
			totalQuantity: 0,
			totalPrice: 0
		};
	}
	next();
});

app.use((req, res, next) => {
	// Make session data available in all views
	res.locals.session = req.session;
	next();
});

app.use((req, res, next) => {
	res.locals.message = req.session.message || null; // Set the message in res.locals
	delete req.session.message; // Clear the message after passing it
	next();
});


// For parsing application
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.json()); // Parses JSON bodies


// View engine setup
app.set('view engine', 'ejs');


// CSS Files Path
app.use('/assets', express.static('style'));
app.use(express.static(path.join(__dirname, './scripts/')));

app.use(express.static(path.join(__dirname, './views/style/')));

// JS Files Path


// Set routes
const home = require('./routes/home.js');
app.use('/', home);

const navbar = require('./routes/navbar.js');
app.use('/navsearch', navbar);

const search = require('./routes/search.js');
app.use('/search', search);

const categories = require('./routes/categories.js');
app.use('/categories', categories);

const products = require('./routes/products.js');
app.use('/products', products);


const cart = require('./routes/cart.js');
app.use('/cart', cart);

const login = require('./routes/login.js');
app.use('/login', login);

const userdata = require('./routes/userdata.js');
app.get('/user', auth, userdata);

const contact = require('./routes/contact.js');
app.use('/contact', contact);


// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});


var port = 8081;
// var server = 
app.listen(port, function () {
	// var host = server.address().address;
	// var port = server.address().port;
	console.log(`Server is listening at http://localhost:${port}`);
});
