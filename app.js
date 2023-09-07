const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const session = require('express-session');
const { render } = require('ejs');
const cloudinary = require('cloudinary').v2; 
const streamifier = require('streamifier'); 
const multer = require('multer');
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });
const path = require('path');
const fs = require('fs');

const app = express();

// const dbConfig = {
//   driver: "mssql",
//   server: "localhost",
//   database: "LaZaPee",
//   user: "sa",
//   password: "Caophankhai2808@",
//   port: 1433,
//   trustServerCertificate: true,
// };

const dbConfig = {
  driver: "mssql",
  server: "localhost",
  database: "LaZaPee",
  user: "sa",
  password: "123",
  port: 1433,
  trustServerCertificate: true,
};
// Dùng để lưu pool kết nối
let sqlPool; 

sql.connect(dbConfig).then(pool => {
    console.log("Connected to SQL Server");
    sqlPool = pool;
}).catch(err => console.error('SQL Connection Error:', err));

cloudinary.config({ 
  cloud_name: 'djey3wddu', 
  api_key: '166845325672825', 
  api_secret: 'E_OuXFOabgNWSnE6Nb2BQ1v1lHQ' 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

//session middleware
app.use(session({
  secret: 'abc123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in a production environment with HTTPS
    maxAge: 3600000, // Set the session to expire after a certain time (1 hour in this case)
  },
}));

const JWT_SECRET = 'some super secret...';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'khai.sendmail@gmail.com',
      pass: 'bfsjnqexelavxnhi',
    },
  });

  // Middleware to authenticate admin
  const authenticateAdmin = async (req, res, next) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(403).redirect('/login/admin');
      }
  
      const userName = req.session.user.userName;
  
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('userName', sql.NVarChar(255), userName)
        .input('allowAdmin', sql.NVarChar(1), 'Y')
        .query('SELECT * FROM Users WHERE UserName = @userName AND AllowAdmin = @allowAdmin');
  
      const admin = result.recordset[0];
  
      if (!admin) {
        return res.status(400).send('Tên đăng nhập không tồn tại hoặc không phải là admin');
      }
  
      if (admin.Status === 0) {
        return res.status(403).send('Tài khoản của bạn đã bị cấm');
      }
  
      // Set user data in the session
      req.session.user = {
        userName: admin.UserName,
        userId: admin.UserID,
        AllowAdmin: admin.AllowAdmin,
        Status: admin.Status,
      };
  
      // Continue to the next middleware or route
      next();
    } catch (error) {
      console.log(error);
      res.status(500).send('Có lỗi xảy ra');
    }
  };
  
  const authenticateUser = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(403).redirect('/login');
    }
    next();
  };

  app.get('/', async (req, res) => {
    try {
      const userSession = req.session.user;
  
      const sqlPool = await sql.connect(dbConfig);
      const result = await sqlPool.request().query('SELECT TOP 8 ProductID, CategoryID,ShopID, ProductName,ProductTypeID,Description,Status, AdminStatus, Price, ImageURL FROM Products  ');
      const products = result.recordset;
          
  
      res.render('index', { products: products, user: userSession });
    } catch (error) {
      console.error("Error loading products:", error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/product/:productId', async (req, res, next) => {
    // Chuyển đổi giá trị productId từ chuỗi sang số nguyên
    const productId = parseInt(req.params.productId, 10);
    
    // Kiểm tra xem giá trị productId có phải là một số hợp lệ hay không
    if (isNaN(productId)) {
        return res.status(400).send('productId phải là số');
    }

    const userSession = req.session.user;
    
    try {
        const sqlPool = await sql.connect(dbConfig);
        const result = await sqlPool.request().input('productId', sql.Int, productId).query('SELECT * FROM Products where Products.ProductID = @productId');
        const products = result.recordset;
      
        console.log("ProductId:", productId);
        console.log(products);
      
        // Render trang EJS với dữ liệu sản phẩm
        res.render('product-detail', { product: products[0], user: userSession });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send('Lỗi máy chủ');
    }
});

  app.get('/404', async (req, res, next) => {
    res.render('404');
  });

  app.get('/login/admin', (req, res, next) => {
    res.render('Admin-login');
  });
  
  app.post('/login/admin', async (req, res, next) => {
    const { userName, password } = req.body;
  
    try {
      const query = `SELECT * FROM Users WHERE UserName = @userName AND AllowAdmin = 'Y'`; // Update your SQL query
      const result = await sqlPool.request()
        .input('userName', sql.NVarChar(255), userName)
        .query(query);
  
      const admin = result.recordset[0];
  
      if (!admin) {
        return res.status(400).send('Tên đăng nhập không tồn tại hoặc không phải là admin');
      }
  
      if (admin.Status === 0) {
        return res.status(403).send('Tài khoản của bạn đã bị cấm');
      }
  
      const checkPass = await bcrypt.compare(password, admin.Password);
  
      if (!checkPass) {
        return res.status(400).send('Mật khẩu không chính xác');
      }
  
      // Set user data in the session
      req.session.user = {
        userName: admin.UserName,
        userId: admin.UserID,
        AllowAdmin: admin.AllowAdmin,
        Status: admin.Status,
      };
  
      // Redirect to admin dashboard
      res.redirect('/admin');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Có lỗi xảy ra');
    }
  });
  
  
  
  app.get('/logout', (req, res) => {
    req.session.user = null; // Clear user data from the session
    res.redirect('/'); // Redirect to the home page or another desired page
  });
app.get('/forgot', (req, res, next) => {
  res.render('forgot-password');
});
app.get('/login', (req, res, next) => {
  res.render('login-signup-user');
});

//FOr user
app.get('/dasboard', authenticateUser, async (req, res) => {
  try {
    const userSession = req.session.user;

    // Fetch user's orders with associated product names from the SQL database
    const pool = await sql.connect(dbConfig);
    const ordersResult = await pool.request()
      .input('userId', sql.Int, userSession.userId)
      .query(`
        SELECT O.*, P.ProductName
        FROM Orders O
        INNER JOIN Products P ON O.ProductID = P.ProductID
        WHERE O.UserID = @userId
      `);

    const orders = ordersResult.recordset;

    res.render('user-dasboard', { orders: orders, user: userSession });
  } catch (error) {
    console.error("Error loading user dashboard:", error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/admin', authenticateAdmin, async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      const pool = await sql.connect(dbConfig);
      const usersResult = await pool.request().query('SELECT * FROM Users');
      const productsResult = await pool.request().query('SELECT * FROM Products');

      const users = usersResult.recordset;
      const products = productsResult.recordset;

      res.render('admin', { users, products, user: req.session.user }); // Pass the 'user' variable here
    } else {
      console.log('Admin authentication failed');
      res.redirect('/login/admin');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/search', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const keyword = req.body.keyword; // Lấy keyword từ request body
    const result = await pool.request()
        .input('keyword', sql.NVarChar(255), `%${keyword}%`)
        .query('SELECT * FROM Products WHERE Products.ProductName LIKE @keyword');
    res.json(result.recordset);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/loadMoreProducts', async (req, res) => {
  try {
      const { offset } = req.body;
      const pool = await sql.connect(dbConfig);
      const response = await pool.request()
          .input('currentOffset', sql.Int, offset)
          .query('SELECT * FROM Products WHERE Products.ProductID > @currentOffset ORDER BY Products.ProductID ASC OFFSET 0 ROWS FETCH NEXT 8 ROWS ONLY');
      
      const products = response.recordset;
      res.send(products);
  } catch (error) {
      console.error("Error loading more products:", error);
      res.status(500).send('Internal Server Error');
  }
});

  
// Update product status in the SQL database
app.post('/admin/update-user-status', async (req, res, next) => {
  const { userId, newStatus } = req.body;

  try {
    // Update the Status field in your SQL database for the specified user
    const query = `UPDATE Users SET Status = @status WHERE UserID = @userId`;
    const result = await sqlPool.request()
      .input('userId', sql.Int, userId)
      .input('status', sql.Int, newStatus === '1' ? 1 : 0)
      .query(query);

    if (result.rowsAffected[0] === 1) {
      res.status(200).send('User account status updated successfully');
    } else {
      throw new Error('Failed to update user account status');
    }
  } catch (error) {
    console.error("Error updating user account status:", error);
    res.status(500).send('Internal Server Error');
  }
});

// Update product status in the SQL database
app.post('/admin/update-product-status', async (req, res, next) => {
  const { productId, newAdminStatus } = req.body;

  try {
    // Update the AdminStatus field in your SQL database for the specified product
    const query = `UPDATE Products SET AdminStatus = @adminStatus WHERE ProductID = @productId`;
    const result = await sqlPool.request()
      .input('productId', sql.Int, productId)
      .input('adminStatus', sql.Bit, newAdminStatus === '1' ? 1 : 0)
      .query(query);

    if (result.rowsAffected[0] === 1) {
      res.status(200).send('Product status updated successfully');
    } else {
      throw new Error('Failed to update product status');
    }
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).send('Internal Server Error');
  }
});




//đăng nhập
app.post('/login', async (req, res, next) => {
  const { userName, password } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('userName', sql.NVarChar(255), userName)
      .query('SELECT * FROM Users WHERE UserName = @userName');

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).send('Tên đăng nhập không tồn tại');
    }
    if (user.Status === 0) {
      return res.status(403).send('Tài khoản của bạn đã bị cấm');
    }

    const checkPass = await bcrypt.compare(password, user.Password);

    if (!checkPass) {
      return res.status(400).send('Mật khẩu không chính xác');
    }

    // Store user data in the session
    req.session.user = {
      userName: user.UserName,
      userId: user.UserID,
      userStatus: user.Status, // You can add more user-related data here
    };

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Có lỗi xảy ra');
  }
});





// Đăng ký
app.post('/signup', async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const userCheck = await pool.request()
      .input('userName', sql.NVarChar(255), userName)
      .query('SELECT * FROM Users WHERE UserName = @userName');

    if (userCheck.recordset.length > 0) {
      return res.status(400).send('Tên đăng nhập đã tồn tại');
    }

    const emailCheck = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (emailCheck.recordset.length > 0) {
      return res.status(400).send('Email đã tồn tại');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      userName,
      email,
      password: hashedPassword,
      Status: 1, // 1 for normal user
    };

    const insertUser = await pool.request()
      .input('userName', sql.NVarChar(255), userName)
      .input('email', sql.NVarChar(255), email)
      .input('password', sql.NVarChar(255), hashedPassword)
      .input('phoneNumber', sql.Char(10), '') // Update with the phone number
      .input('homeAddress', sql.NVarChar(255), '') // Update with the home address
      .input('allowAdmin', sql.NVarChar(1), 'N') //  'N' for not admin
      .input('Status', sql.Int, 1) // 1 for normal user
      .query('INSERT INTO Users (UserName, Password, Email, PhoneNumber, HomeAddress, AllowAdmin, Status) VALUES (@userName, @password, @email, @phoneNumber, @homeAddress, @allowAdmin, @Status)');

    if (insertUser.rowsAffected[0] === 1) {
      res.status(201).send('Đăng kí thành công');
    } else {
      throw new Error('Không thể tạo người dùng mới');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Có lỗi xảy ra khi đăng ký');
  }
});



app.post('/forgot', async (req, res, next) => {
  const { email } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // Replace with your SQL query to fetch user by email
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM Users WHERE Email = @email');
    const user = result.recordset[0];

    // Make sure user exists in the database
    if (!user) {
      return res.send('Email không tồn tại trong hệ thống, vui lòng nhập lại hoặc đăng kí tài khoản');
    }

    // User exists, create a one-time link valid for 15 minutes
    const secret = JWT_SECRET + user.Password;
    const payload = {
      email: user.Email,
      id: user.UserID,
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const link = `http://localhost:3000/reset-password/${user.UserID}/${token}`;

    const mailOptions = {
      from: 'khai.sendmail@gmail.com',
      to: user.Email,
      subject: 'Password Reset Link',
      text: `Here is your password reset link: ${link}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.send('Error sending email.');
      } else {
        console.log('Email sent: ' + info.response);
        res.render('email-sent-success');
      }
    });
  } catch (error) {
    console.log(error);
    res.send('Error occurred.');
  }
});

app.get('/reset-password/:id/:token', async (req, res, next) => {
  const { id, token } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // Retrieve user information by ID from the database
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserID = @id');
    const user = result.recordset[0];

    if (!user) {
      return res.send('ID không hợp lệ');
    }

    // Verify the token with the user's secret key
    const secret = JWT_SECRET + user.Password;
    const payload = jwt.verify(token, secret);

    res.render('reset-password', { email: user.Email });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

app.post('/reset-password/:id/:token', async (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // Retrieve user information by ID from the database
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserID = @id');
    const user = result.recordset[0];

    if (!user) {
      return res.send('ID không hợp lệ');
    }

    // Verify the token with the user's secret key
    const secret = JWT_SECRET + user.Password;
    const payload = jwt.verify(token, secret);

    if (password !== password2) {
      return res.send('Mật khẩu không khớp, vui lòng quay lại trang trước');
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password in the database
    await pool.request()
      .input('id', sql.Int, id)
      .input('password', sql.NVarChar(255), hashedPassword)
      .query('UPDATE Users SET Password = @password WHERE UserID = @id');

    res.send('Mật khẩu đã được cập nhật thành công, vui lòng đăng nhập lại');
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

//cart
app.get('/cart', authenticateUser, async (req, res) => {
  try {
    const userSession = req.session.user;

    // Fetch user's orders from the SQL database
    const pool = await sql.connect(dbConfig);
    const orderResult = await pool.request()
      .input('userId', sql.Int, userSession.userId)
      .query('SELECT * FROM Orders WHERE UserID = @userId');

    const orders = orderResult.recordset;

    res.render('cart', { orders: orders, user: userSession });
  } catch (error) {
    console.error("Error loading cart:", error);
    res.status(500).send('Internal Server Error');
  }
});


//Seller page:
app.get('/seller', authenticateUser, async (req, res) => {
  try {
    const userSession = req.session.user;

    // Fetch product information from the SQL database
    const pool = await sql.connect(dbConfig);
    const productResult = await pool.request()
      .input('shopId', sql.Int, userSession.userId)
      .query('SELECT * FROM Products WHERE ShopID = @shopId');

    const products = productResult.recordset;

    // Fetch order information including the corresponding product name from the SQL database
    const orderResult = await pool.request()
      .input('userId', sql.Int, userSession.userId) // Use 'userId' here
      .query(`
        SELECT O.*, P.ProductName
        FROM Orders O
        INNER JOIN Products P ON O.ProductID = P.ProductID
        WHERE O.UserID = @userId
      `);

    const orders = orderResult.recordset;

    // Render the seller.ejs template with product and order data
    res.render('seller-homepage', { products: products, orders: orders, user: userSession });
  } catch (error) {
    console.error("Error loading product and order information:", error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/seller/update-user-product-status', async (req, res) => {
  const { productId, newStatus } = req.body;

  try {
      // Convert the numeric value (1, 0, or 3) to a boolean value
      const booleanNewStatus = newStatus === 1 || newStatus === 0;

      // Update the Status field in your SQL database for the specified product
      const query = 'UPDATE Products SET Status = @booleanNewStatus WHERE ProductID = @productId';
      const result = await sqlPool.request()
          .input('productId', sql.Int, productId)
          .input('booleanNewStatus', sql.Bit, booleanNewStatus)
          .query(query);

      if (result.rowsAffected[0] === 1) {
          res.status(200).send('Product status updated successfully');
      } else {
          throw new Error('Failed to update product status');
      }
  } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/sell-product', upload.single('productImage'), async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productDescription,
      productType,
      productQuantity,
      productCategory,
    } = req.body;

    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).send('Image is required');
    }

    // Create a custom stream from the Buffer using streamifier
    const imageStream = streamifier.createReadStream(req.file.buffer);

    // Use Promises with async/await to upload the image
    const cloudinaryUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'product_images' }, // Customize the folder where images are stored in Cloudinary
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      imageStream.pipe(uploadStream);
    });

    // Extract the Cloudinary image URL
    const imageUrl = cloudinaryUpload.secure_url;

    // Store the product information in your SQL database, including the Cloudinary image URL
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('ProductName', sql.NVarChar, productName)
      .input('ProductPrice', sql.Decimal, productPrice)
      .input('ProductDescription', sql.NVarChar, productDescription)
      .input('ProductType', sql.NVarChar, productType)
      .input('ProductImage', sql.NVarChar, imageUrl) // Store the Cloudinary image URL
      .input('ProductQuantity', sql.Int, productQuantity)
      .input('ProductCategory', sql.Int, productCategory)
      .query(`
        INSERT INTO Products (CategoryID, ShopID, ProductName, ProductTypeID, Description, Status, AdminStatus, Price, ImageURL)
        VALUES (@ProductCategory, 1, @ProductName, @ProductType, @ProductDescription, 1, 1, @ProductPrice, @ProductImage)
      `);

    res.status(200).send('Product added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding product');
  }
});





app.listen(3000, () => console.log('🚀 @ http://localhost:3000'));