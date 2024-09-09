const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Category = sequelize.define('Category', {
	CategoryID: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	imageurl: {
		type: DataTypes.STRING,
		allowNull: true
	}
},
{
	tableName: 'CATEGORIES', // Explicitly define the table name as CATEGORIES
	timestamps: false,       // Disable automatic timestamp fields (createdAt, updatedAt)
});


module.exports = Category;