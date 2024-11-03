const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./categoryModel');
const ProductRetailer = require('./productRetailerModel');
// const Retailer = require('./retailerModel');


const Product = sequelize.define('Product', {
	ProductID: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
	},
	brand: {
		type: DataTypes.TEXT,
	},
	imageurl: {
		type: DataTypes.TEXT,
	},
	year: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	categoryID: {
		type: DataTypes.INTEGER,
		references: {
			model: Category,
			key: 'CategoryID'
		},
		allowNull: false
	}
},
{
	tableName: 'PRODUCTS', // Explicitly define the table name as PRODUCTS
	timestamps: false     // Disable automatic timestamp fields (createdAt, updatedAt)
});

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(ProductRetailer, { foreignKey: 'ProductID' });



module.exports = Product;