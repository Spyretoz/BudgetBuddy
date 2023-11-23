DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Retailers;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS PriceHistory;



-- Create Categories table
CREATE TABLE Categories (
    CategoryID SERIAL PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL
);

-- Create Retailers table
CREATE TABLE Retailers (
    RetailerID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Location VARCHAR(255),
    Website VARCHAR(255),
    ContactInfo VARCHAR(255)
);

-- Create Users table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL
);

-- Create Products table
CREATE TABLE Products (
    ProductID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    CategoryID INTEGER REFERENCES Categories(CategoryID),
    Brand VARCHAR(255),
    Price DECIMAL(10, 2) NOT NULL,
    Year SMALLINT NOT NULL
);

-- Create Reviews table
CREATE TABLE Reviews (
    ReviewID SERIAL PRIMARY KEY,
    ProductID INTEGER REFERENCES Products(ProductID),
    UserID INTEGER REFERENCES Users(UserID),
    Rating INTEGER,
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