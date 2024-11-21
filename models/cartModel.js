const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    timestamps: true,
});

module.exports = Cart;