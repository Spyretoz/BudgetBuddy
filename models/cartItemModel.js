const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = require('./cartModel'); // Import Cart model
const Retailer = require('./retailerModel');

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
            model: 'Retailers',
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
    timestamps: true,
});

// Associations
CartItem.belongsTo(Cart, { foreignKey: 'CartID', onDelete: 'CASCADE' }); // Associate with Cart
CartItem.belongsTo(Retailer, { foreignKey: 'RetailerID' }); // Associate with Retailer
module.exports = CartItem;