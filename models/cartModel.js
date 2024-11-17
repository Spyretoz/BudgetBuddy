const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./productModel'); // Product model
const ProductRetailer = require('./productRetailerModel'); // Retailer model

const Cart = sequelize.define('Cart', {
	CartID: {
	  type: DataTypes.INTEGER,
	  autoIncrement: true,
	  primaryKey: true
	},
	ProductID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Product', // Table name
			key: 'ProductID',
		},
		onDelete: 'CASCADE'
	},
	RetailerID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'ProductRetailer', // Table name
			key: 'RetailerID',
		},
		onDelete: 'CASCADE'
	},
	Quantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 1
		}
	},
	CreatedAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	UpdatedAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	}
},
{
	tableName: 'Cart',
	timestamps: true,
	updatedAt: 'UpdatedAt',
	createdAt: 'CreatedAt'
});

module.exports = Cart;