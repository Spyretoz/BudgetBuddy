const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetailerReviews = sequelize.define('RetailerReviews', {
	ReviewID: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	ProductID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Products', // References the Products table
			key: 'ProductID',
		},
	},
	UserID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Users', // References the Users table
			key: 'UserID',
		},
	},
	Rating: {
		type: DataTypes.DECIMAL(2, 1),
		allowNull: false,
		validate: {
			min: 1,
			max: 5
		}
	},
	Comment: {
		type: DataTypes.TEXT,
		allowNull: true,
	}
}, 
{
	tableName: 'RetailerReviews',
	timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

module.exports = RetailerReviews;