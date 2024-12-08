const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
	UserID: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
    email: {
		type: DataTypes.STRING,
		allowNull: false
	},
    password: {
		type: DataTypes.STRING,
		allowNull: false
	},
    isretailer: {
        type: DataTypes.BOOLEAN
    }
}, 
{
	tableName: 'Users',
    timestamps: false // Disable automatic timestamp fields (createdAt, updatedAt)
});

module.exports = User;