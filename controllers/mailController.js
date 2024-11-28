const nodemailer = require('nodemailer');


exports.sendEmail = async (req, res) => {
	const { name, email, message } = req.body;

	// Set up the email transporter
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.SKR_EMAIL, // Replace with your Gmail email address
			pass: process.env.SKR_APP_PASSWORD, // Replace with your Gmail password or an app-specific password
		}
	});

	// Set up the email options
	const mailOptions = {
		from: process.env.SKR_EMAIL, // Replace with your Gmail email address
		to: [process.env.SKR_EMAIL, process.env.MY_EMAIL], // Replace with your email address to receive messages
		subject: 'New Contact Form',
		text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
	};

	try {
		// Send the email
		await transporter.sendMail(mailOptions);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.status(500)
	}
};