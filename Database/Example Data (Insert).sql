

-- Insert 
INSERT INTO Users (UserName, Password, Email, PhoneNumber, HomeAddress, AllowAdmin, Status)
VALUES ('SuperAdmin', '$2a$10$SRW5wHN9w/PJWs6NSjSQ7.7HfvTdqNdVDj98h199DUO956re/5UjC', 'latipee.noreply@gmail.com', '0845679711', '', 'Y', 1);

INSERT INTO Users (UserName, Password, Email, PhoneNumber, HomeAddress, AllowAdmin, Status)
VALUES ('PhanKhai', '$2a$10$SRW5wHN9w/PJWs6NSjSQ7.7HfvTdqNdVDj98h199DUO956re/5UjC', 'caophakhai123@gmail.com', '0845679711', '', 'N', 1);

	-- Inserting data for product 1
INSERT INTO Products (CategoryID, ShopID, ProductName, ProductTypeID, Description, Status, AdminStatus, Price)
VALUES ('1', 1, 'Laptop', 1, 'High-performance laptop with 16GB RAM', 1, 1, 1000);

-- Inserting data for product 2
INSERT INTO Products (CategoryID, ShopID, ProductName, ProductTypeID, Description, Status, AdminStatus, Price)
VALUES ('1', 2, 'Smartphone', 2, 'Latest smartphone with 128GB storage', 1, 1, 800);

-- Insert data into the Orders table
INSERT INTO Orders (UserID, ShopID, ProductID, Quantity, OrderDate, Total, Status, Address, UsersOrderName, ShipmentName, ShipmentID)
VALUES
    (1, 2, 2, 2, '2023-09-06 14:30:00', 100, 1, '123 Main St, City', 'John Doe', 'Shipping Company A', 'XYZ12345'),
    (2, 1, 2, 1, '2023-09-06 15:45:00', 50, 1, '456 Elm St, Town', 'Jane Smith', 'Shipping Company B', 'ABC67890'),
    (2, 2, 2, 3, '2023-09-06 16:00:00', 150, 1, '789 Oak St, Village', 'Bob Johnson', 'Shipping Company C', 'PQR54321');

--insert data into ProductTypes
INSERT INTO ProductTypes (ProductID, ShopID, ProductTypeID, Type)
VALUES
	(1,1,3,'YOuta'),
	(1,1,3,'YOuta2'),
	(1,1,3,'YOuta3'),
	(1,1,3,'YOuta4')

	-- products
DECLARE @i INT = 1
WHILE @i <= 20
BEGIN
    IF @i % 2 = 0 -- to alternate between the two shops and product types
    BEGIN
        INSERT INTO Products (CategoryID, ShopID, ProductName, ProductTypeID, Description, Status, AdminStatus, Price)
        VALUES (1, 2, 'Smartphone' + CAST(@i AS NVARCHAR(5)), '3', 'Latest smartphone with 128GB storage', 1, 1, 800);
    END
    ELSE
    BEGIN
        INSERT INTO Products (CategoryID, ShopID, ProductName, ProductTypeID, Description, Status, AdminStatus, Price)
        VALUES (1, 1, 'Laptop' + CAST(@i AS NVARCHAR(5)), '4', 'High-performance laptop with 16GB RAM', 1, 1, 1000);
    END
    SET @i = @i + 1;
END

select *from Products




--product-image
DECLARE @ProductID INT = 5
WHILE @ProductID <= 22
BEGIN
    INSERT INTO PRODUCT_IMAGE (ProductID, ImageURL)
    VALUES (@ProductID, 'product.png');
    SET @ProductID = @ProductID + 1;
END

