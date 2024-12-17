DROP TABLE IF EXISTS PriceHistory;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Retailers;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS CartItems;



-- Create Categories table
CREATE TABLE Categories (
    CategoryID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    IMAGEURL VARCHAR(255)
);

-- Create Products table
CREATE TABLE Products (
    ProductID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    CategoryID INTEGER REFERENCES Categories(CategoryID)  NOT NULL,
    Brand VARCHAR(255),
    IMAGEURL VARCHAR(255),
    Year SMALLINT NOT NULL
);

-- Create Retailers table
CREATE TABLE Retailers (
    RetailerID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Location VARCHAR(255),
    Website VARCHAR(255),
    ContactInfo VARCHAR(255),
    IMAGEURL VARCHAR(255)
);

-- Create ProductRetailers table
CREATE TABLE ProductRetailers (
    ProductRetailersID SERIAL PRIMARY KEY,
    RetailerID INTEGER REFERENCES Retailers(RetailerID)  NOT NULL,
    ProductID INTEGER REFERENCES Products(ProductID)  NOT NULL,
    PRODUCTLINK VARCHAR(255) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL
);

-- Create Users table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    IsRetailer BOOLEAN NOT NULL DEFAULT FALSE
);



-- Create Reviews table
CREATE TABLE Reviews (
    ReviewID SERIAL PRIMARY KEY,
    ProductID INTEGER REFERENCES Products(ProductID),
    UserID INTEGER REFERENCES Users(UserID),
    Rating INTEGER NOT NULL,
    Comment TEXT
);

-- Create PriceHistory table
CREATE TABLE PriceHistory (
    PriceHistoryID SERIAL PRIMARY KEY,
    ProductID INTEGER REFERENCES Products(ProductID),
    RetailerID INTEGER REFERENCES Retailers(RetailerID),
    Price DECIMAL(10, 2) NOT NULL,
    Date DATE NOT NULL
);



CREATE TABLE Carts (
    CartID SERIAL PRIMARY KEY,
    UserID INTEGER REFERENCES Users(UserID) ON DELETE CASCADE,
    TotalQuantity INTEGER NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL
);

CREATE TABLE CartItems (
    CartItemID SERIAL PRIMARY KEY,
    CartID INTEGER REFERENCES Carts(CartID) ON DELETE CASCADE,
    ProductID INTEGER REFERENCES Products(ProductID),
    RetailerID INTEGER REFERENCES Retailers(RetailerID),
    Quantity INTEGER NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL
);