const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CartItem = require('./cartItemModel');

const Cart = sequelize.define('Cart', {
	CartID: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	UserID: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Users',
			key: 'UserID'
		}
	},
	TotalQuantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	TotalPrice: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0.0
	}
}, 
{
	tableName: 'Carts',
	timestamps: false,
});

// Define association with CartItem
Cart.hasMany(CartItem, { foreignKey: 'CartID', onDelete: 'CASCADE' });
//CartItem.belongsTo(Cart, { foreignKey: 'CartID', as: 'Cart', onDelete: 'CASCADE' });


module.exports = Cart;