const sequelize = require('./config/db');
const Retailer = require('./models/Retailer'); // Import the Retailer model

// Sync the model with the database (create table if not exists)
sequelize.sync({ force: false })  // Set to false to avoid dropping tables accidentally
.then(() => {
	console.log('Database & tables synced!');
})
.catch(error => {
	console.error('Error syncing database:', error);
});