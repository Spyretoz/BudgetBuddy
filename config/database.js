const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
	host: process.env.PGHOST,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT
});


module.exports = client