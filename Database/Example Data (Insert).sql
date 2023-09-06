use master
go 

CREATE DATABASE LaTiPee
GO

USE LaTiPee
GO

-- Insert 
INSERT INTO Users (UserName, Password, Email, PhoneNumber, HomeAddress, AllowAdmin, Status)
VALUES ('SuperAdmin', '$2a$10$SRW5wHN9w/PJWs6NSjSQ7.7HfvTdqNdVDj98h199DUO956re/5UjC', 'latipee.noreply@gmail.com', '0845679711', '', 'Y', 1);

INSERT INTO Users (UserName, Password, Email, PhoneNumber, HomeAddress, AllowAdmin, Status)
VALUES ('PhanKhai', '$2a$10$SRW5wHN9w/PJWs6NSjSQ7.7HfvTdqNdVDj98h199DUO956re/5UjC', 'caophakhai123@gmail.com', '0845679711', '', 'N', 1);

	-- Inserting data for product 1
INSERT INTO Products (CategoryID, ShopID, ProductName, Product_Type, Description, Status, AdminStatus, Price)
VALUES ('1', 1, 'Laptop', 'Electronics', 'High-performance laptop with 16GB RAM', 1, 1, 1000);

-- Inserting data for product 2
INSERT INTO Products (CategoryID, ShopID, ProductName, Product_Type, Description, Status, AdminStatus, Price)
VALUES ('1', 2, 'Smartphone', 'Electronics', 'Latest smartphone with 128GB storage', 1, 1, 800);

-- Insert data into the Orders table
INSERT INTO Orders (UserID, ShopID, ProductID, Quantity, OrderDate, Total, Status, Address, UsersOrderName, ShipmentName, ShipmentID)
VALUES
    (1, 2, 3, 2, '2023-09-06 14:30:00', 100, 1, '123 Main St, City', 'John Doe', 'Shipping Company A', 'XYZ12345'),
    (2, 1, 4, 1, '2023-09-06 15:45:00', 50, 1, '456 Elm St, Town', 'Jane Smith', 'Shipping Company B', 'ABC67890'),
    (2, 2, 2, 3, '2023-09-06 16:00:00', 150, 1, '789 Oak St, Village', 'Bob Johnson', 'Shipping Company C', 'PQR54321');

