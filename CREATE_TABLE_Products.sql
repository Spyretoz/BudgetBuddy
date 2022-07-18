CREATE TABLE Products (
    ProductID int NOT NULL AUTO_INCREMENT,
    ProductName varchar(255) NOT NULL,
    ProductCategory varchar(255) NOT NULL,
    ProductSubCategory varchar(255) NOT NULL,
    ProductPrice DECIMAL(10, 2) NOT NULL,
    Store varchar(255) NOT NULL,
    PRIMARY KEY (ProductID)
);


SELECT * FROM Products;