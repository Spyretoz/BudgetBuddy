const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

NODE_TLS_REJECT_UNAUTHORIZED = 0;

const client = new Client({
	connectionString: process.env.DATABASE_CONNECTION,
	// host: process.env.PGHOST,
	// user: process.env.PGUSER,
	// password: process.env.PGPASSWORD,
	// port: process.env.PGPORT,
	// database: process.env.SCHEMA
});


module.exports = client