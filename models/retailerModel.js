const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RetailerReview = require('./retailerReviewsModel');
const CartItem = require('./cartItemModel');


const Retailer = sequelize.define('Retailer', {
	RetailerId: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false
	},
	Name: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	Location: {
		type: DataTypes.STRING(255),
		allowNull: true
	},
	Website: {
		type: DataTypes.STRING(255),
		allowNull: true
	},
	ContactInfo: {
		type: DataTypes.STRING(255),
		allowNull: true
	},
	IMAGEURL: {
		type: DataTypes.STRING(255),
		allowNull: true
	}
}, 
{
	tableName: 'Retailers', // Ensure the table name matches exactly, as it's case-sensitive in PostgreSQL
	timestamps: false, // Disable timestamps if not needed
});

Retailer.hasMany(RetailerReview, { foreignKey: 'RetailerID' });

CartItem.belongsTo(Retailer, { foreignKey: 'RetailerID' });


module.exports = Retailer;