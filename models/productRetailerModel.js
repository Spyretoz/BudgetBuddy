const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Retailer = require('./retailerModel'); // Import the Retailer model
const Product = require('./productModel'); // Import the Product model


const ProductRetailer = sequelize.define('ProductRetailer', {
	ProductRetailersID: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false
	},
	RetailerID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Retailer,
			key: 'RetailerId'
		}
	},
	ProductId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Product,
			key: 'ProductID'
		}
	},
	PRODUCTLINK: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	Price: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
}, {
	tableName: 'PRODUCTRETAILERS', // Ensure the table name matches your database schema exactly
	timestamps: false // Disable timestamps if not required
});

ProductRetailer.belongsTo(Retailer, { foreignKey: 'RetailerID' }); // ProductRetailer belongs to Retailer

module.exports = ProductRetailer;