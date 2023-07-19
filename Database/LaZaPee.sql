CREATE DATABASE LaZaPee
GO

USE LaZaPee
GO
-- Quản lý tài khoản users
CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY,
  UserName NVARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL
  -- Thêm các trường thông tin khác cho người dùng
);
GO
CREATE TABLE Shipper (
  ShipperID INT PRIMARY KEY IDENTITY,
  name NVARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  identifier VARCHAR(10) NOT NULL,
  numberPhone CHAR(10) NOT NULL
  -- Thêm các trường thông tin khác cho người dùng
);
GO
-- Danh mục sản phẩm
CREATE TABLE Categories (
  CategoryID INT PRIMARY KEY IDENTITY,
  CategoryName NVARCHAR(255) NOT NULL,
);
GO
-- Sản phẩm
CREATE TABLE Products (
  ProductID INT PRIMARY KEY IDENTITY,
  ProductName NVARCHAR(255) NOT NULL,
  CategoryID INT NOT NULL,
  Description NVARCHAR(MAX) NOT NULL,
  IMAGE varbinary(max)NOT NULL,
  Price numeric(10, 0) NOT NULL, check (Price >= 0),
  FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
GO
-- Giỏ hàng
CREATE TABLE ShoppingCart (
  CartID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  ProductID INT NOT NULL,
  Quantity INT NOT NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
-- Đơn hàng
CREATE TABLE Orders (
  OrderID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  ProductID INT NOT NULL,
  Quantity INT NOT NULL,
  OrderDate DATETIME NOT NULL,
  Status NVARCHAR(255),
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
-- Đánh giá và nhận xét
CREATE TABLE Reviews (
  ReviewID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  ProductID INT NOT NULL,
  Rating INT NOT NULL,
  Comment NVARCHAR(MAX) NOT NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
-- Khuyến mãi và giảm giá
CREATE TABLE Promotions (
  PromotionID INT PRIMARY KEY IDENTITY,
  ProductID INT NOT NULL,
  Discount FLOAT NOT NULL,
  StartDate DATETIME NOT NULL,
  EndDate DATETIME NOT NULL,
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO
-- Quy trình giao hàng
CREATE TABLE ShippingProcess (
  ProcessID INT PRIMARY KEY IDENTITY,
  OrderID INT NOT NULL,
  
  Status NVARCHAR(255) NOT NULL,
  -- Thêm các trường thông tin khác về quy trình giao hàng
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);
GO
-- Thống kê doanh thu
CREATE TABLE Sales (
  SalesID INT PRIMARY KEY IDENTITY,
  UserID INT NOT NULL,
  OrderID INT NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  Date DATETIME NOT NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);
GO