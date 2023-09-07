use master
go 

CREATE DATABASE LaZaPee
GO

USE LaZaPee
GO
CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY,
  UserName NVARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  PhoneNumber CHAR(10) NOT NULL,
  HomeAddress NVARCHAR(255) NOT NULL,
  AllowAdmin VARCHAR(1) NOT NULL,
  Status INT NOT NULL
);
GO
CREATE TABLE Categories (
  CategoryID INT PRIMARY KEY IDENTITY,
  CategoryName NVARCHAR(255) NOT NULL,
);
GO
CREATE TABLE Products (
  ProductID INT PRIMARY KEY IDENTITY,
  CategoryID INT NOT NULL,
  ShopID INT NOT NULL, 
  ProductName NVARCHAR(255) NOT NULL,
  Product_Type NVARCHAR(MAX),
  Description NVARCHAR(MAX) NOT NULL,
  Status INT NOT NULL,
  AdminStatus BIT NOT NULL,
  Price DECIMAL(10,0) NOT NULL, check (Price >= 0),
  FOREIGN KEY (ShopID) REFERENCES Users(UserID),
  FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
GO
CREATE TABLE PRODUCT_IMAGE(
	ImageID INT Primary key,
	ProductID INT NOT NULL,
	ImageURL VARCHAR(MAX),
	FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
CREATE TABLE Orders (
  OrderID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  ShopID INT NOT NULL,
  ProductID INT NOT NULL,
  Quantity INT NOT NULL,
  OrderDate DATETIME NOT NULL,
  Total DECIMAL(10,0) NOT NULL,
  Status BIT NOT NULL,
  Address NVARCHAR(255) NOT NULL,
  UsersOrderName NVARCHAR(255) NOT NULL,
  ShipmentName NVARCHAR(255) NOT NULL,
  ShipmentID NVARCHAR(255) NOT NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
CREATE TABLE Reviews (
  ReviewID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  ProductID INT NOT NULL,
  Rating INT NOT NULL,
  Comment NVARCHAR(MAX) NOT NULL,
  ImageURL VARCHAR(MAX),
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
CREATE TABLE Promotions (
  PromotionID INT PRIMARY KEY IDENTITY,
  ProductID INT NOT NULL,
  Discount FLOAT NOT NULL,
  StartDate DATETIME NOT NULL,	
  EndDate DATETIME NOT NULL,
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
-- Insert data into the Categories table
INSERT INTO Categories (CategoryName)
VALUES
    ( 'Điện Tử'),
    ('Gia Dụng'),
	('Sắc Đẹp'),
    ('Thời Trang');
	
	select * from Categories
	select * from Products




	



