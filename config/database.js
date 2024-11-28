const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();


const sequelize  = new Sequelize(process.env.DATABASE_CONNECTION, {
	operatorsAliases: false,
	quoteIdentifiers: false,
	freezeTableName: true
});


sequelize.authenticate()
.then(() => {
	console.log('Connection to the PostgreSQL database has been established successfully.');
})
.catch((error) => {
	console.error('Unable to connect to the PostgreSQL database: ', error);
});


module.exports = sequelize