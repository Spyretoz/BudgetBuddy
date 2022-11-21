var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config/database')

// Connect to db
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'sqluser',
	password: 'password',
	database: 'NodeSkroutzDB'
});

// Init app
const app = express();

// View engine setup
app.set('view engine', 'ejs');


// CSS Files Path
app.use('/assets', express.static('style'));
app.use(express.static(path.join(__dirname, './views/style/')));


app.get('/home', (req, res) => {
	res.render('home', { title: "Welcome to Skroutz" });
});


app.get('/categories', (req, res) => {
	res.render('categories', { title: "Choose category" });
});


app.get('/tech', (req, res) => {
	res.render('products', { title: "Tech And Stuff" });
});

// app.get('/show_carriers', function(request, response)
// {
// 	if (request.session.loggedin) 
// 	{
// 		connection.query("SELECT car_name FROM carrier;", function(error, results, fields) 
// 		{
// 			if (error) throw error;
// 			console.log(results);
//    			response.send(results);       
// 		});
// 	}
// 	else 
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });

app.get('/fashion', (req, res) => {
	res.render('products', { title: "Fashion" });
});

app.get('/carsmoto', (req, res) => {
	res.render('products', { title: "Cars And Moto" });
});

app.get('/contact', (req, res) => {
	res.render('contact', { title: "Contact Us" });
});


// Set routes
var pages = require('./routes/pages.js');
app.use('/', pages);


// Express Validator Middleware

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
})







// app.get('/register', function(request, response) 
// {
// 	if (request.session.loggedin) 
// 	{
// 		response.redirect('/newappoint');
// 	}
// 	else
// 	{
// 		response.sendFile(path.join(__dirname + '/signup.html'));
// 	}
// });



// app.get('/appoin-list', function(request, response) 
// {
// 	if (request.session.loggedin) 
// 	{
// 		response.sendFile(path.join(__dirname + '/appointments.html'));
// 	}
// 	else
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });

// app.get('/newappoint', function(request, response) 
// {
// 	if (request.session.loggedin) 
// 	{
// 		response.sendFile(path.join(__dirname + '/create_appointment.html'));
// 	}
// 	else
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });

// app.get('/updata', function(request, response) 
// {
// 	if (request.session.loggedin) 
// 	{
// 		response.sendFile(path.join(__dirname + '/add_data.html'));
// 	}
// 	else
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });

// app.get('/showinfo', function(request, response) 
// {
// 	if (request.session.loggedin) 
// 	{
// 		response.sendFile(path.join(__dirname + '/show_personal_info.html'));
// 	}
// 	else
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });


// app.get('/Appointment', function (req, res) 
// {
//     res.sendFile(path.resolve("Appointment.css"));
// });


// app.post('/auth', function(request, response) 
// {
// 	var username = request.body.username;
// 	var password = request.body.password;

// 	if (username && password) 
// 	{
// 		connection.query('SELECT cit_password FROM citizen WHERE cit_username = ?', [username], function(error, results, fields)
// 		{
// 	 		if (results.length > 0)
// 			{
// 				var txt = JSON.stringify(results[0]);
// 				var obj = JSON.parse(txt);

// 				var result = bcrypt.compareSync(password, obj.cit_password);
// 				if (result)
// 				{
// 					request.session.loggedin = true;
// 					request.session.username = username;
// 					response.redirect('/newappoint');
// 				}
// 				else
// 				{
// 					response.send("Incorrect Username and/or Password!");
// 				}
// 			} 
// 			else 
// 			{
// 				response.send('Incorrect Username and/or Password!');
// 			}			
// 			response.end();
// 		});
// 	} 
// 	else 
// 	{
// 		response.send('Please enter Username and Password!');
// 		response.end();
// 	}
// });


// // Insert a citizen
// app.post('/register', function (req, res)
// {
//     connection.connect();
//     var hash = bcrypt.hashSync(req.body.password, 12);
//     var sql = "INSERT INTO citizen VALUES(0,'" + req.body.username + "','" + hash + "','" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.fathersName + "','" + req.body.email + "',null, null, null, null, null, null)";
//     console.log(sql);

//     connection.query(sql, (err) => 
//     {       
//         var resultJson;
//         if(!err)        
//         {
//             resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
//             console.log(req.body);
//         }
//         else
//         {
//             resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
//             console.log("ERROR");
//         }
//         res.end(resultJson);
//     });
//     connection.end();

//     res.redirect('/');
// });





// app.get('/appointments', function(request, response) 
// {

// 	if (request.session.loggedin) 
// 	{
// 		var username = request.session.username;
// 		console.log(username);

// 		connection.query("SELECT * FROM appointment WHERE app_citizen = '" + username + "' AND `accepted`=1;", function(error, results, fields) 
// 		{
// 			if (error) throw error;
// 			console.log(results);
//    			response.send(results);       
// 		});
// 	}
// 	else 
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });


// app.post('/appointment', function(req, res) 
// {
// 	var username = req.session.username;
// 	console.log(username);
// 	if (req.session.loggedin) 
// 	{
//     	var sql = "INSERT INTO appointment VALUES(0,'" + req.body.app_time + "','" + req.body.app_date + "','" + username + "','" + req.body.app_carrier + "','" + req.body.app_extraINFO + "',0)";
//     	console.log(sql);

//     	connection.query(sql, (err) => 
//     	{       
//         	var resultJson;
//         	if(!err)        
//         	{
//             	resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
//             	console.log(req.body);
//             	res.redirect('/newappoint');
//         	}
//         	else
//         	{
//           		resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
//             	console.log("ERROR");
//         	}
//         	res.end(resultJson);
//     	});
// 	} 
// 	else 
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });


// app.post('/update', function(req, res) 
// {
// 	if (req.session.loggedin) 
// 	{
// 		var username = req.session.username;
// 		console.log(username);
//     	var sql = "UPDATE citizen SET phoneNumber = '" + req.body.phoneNumber + "', birthDate = '" + req.body.birthDate + "', afm = '" + req.body.AFM + "', amka = '" + req.body.AMKA + "', county = '" + req.body.county + "', city = '" + req.body.city + "' WHERE cit_username = '" + username + "';";
//     	console.log(sql);

//     	connection.query(sql, (err) => 
//     	{       
//         	var resultJson;
//         	if(!err)        
//         	{
//             	resultJson = JSON.stringify([{'ADD':'SUCCESS'}]);
//             	console.log(req.body);
//             	res.redirect('/showinfo');
//         	}
//         	else
//         	{
//           		resultJson = JSON.stringify([{'ADD':'FAIL'}]); 
//             	console.log("ERROR");
//         	}
//         	res.end(resultJson);
//     	});
// 	} 
// 	else 
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });

// app.get('/show_personal', function(request, response)
// {
// 	var username = request.session.username;
// 	if (request.session.loggedin) 
// 	{
// 		connection.query("SELECT * FROM citizen WHERE cit_username ='" + username + "';", function(error, results, fields) 
// 		{
// 			if (error) throw error;
// 			console.log(results);
//    			response.send(results);       
// 		});
// 	}
// 	else 
// 	{
// 		response.send('Please login to view this page!');
// 	}
// });





var port = 8081;
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log(`Example app listening at http://${host}:${port}`);
});