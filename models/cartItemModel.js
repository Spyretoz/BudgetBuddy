const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const CartItem = sequelize.define('CartItem', {
	CartItemID: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	CartID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Carts',
			key: 'CartID'
		}
	},
	ProductID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Products',
			key: 'ProductID'
		}
	},
	RetailerID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Retailer',
			key: 'RetailerID'
		}
	},
	Quantity: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	TotalPrice: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
}, 
{
	tableName: 'CartItems',
	timestamps: false,
});



module.exports = CartItem;