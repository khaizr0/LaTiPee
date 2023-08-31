const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sql = require('mssql');


// const dbConfig = {
//   user : 'Talent/0392956804',
//   password : '',
//   server: 'localhost', 
//   database: 'LaZaPee',
//   options: {
//     encrypt: true,  
//     trustServerCertificate: true  
//   }
// };

// // Dùng để lưu pool kết nối
// let sqlPool; 

// sql.connect(dbConfig).then(pool => {
//     console.log("Connected to SQL Server");
//     sqlPool = pool;
// }).catch(err => console.error('SQL Connection Error:', err));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


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
  app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/Products?_start=0&_limit=8');
        let products = response.data;
        console.log(products); 
        res.render('index', { products: products });
    } catch (error) {
        console.error("Error loading products:", error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/admin', (req, res, next) => {
  res.render('Admin-login');
});

app.get('/forgot-password', (req, res, next) => {
  res.render('forgot-password');
});
app.get('/login', (req, res, next) => {
  res.render('login-signup-user');
});

app.post('/loadMoreProducts', async (req, res) => {
  try {
    const { offset } = req.body;
    const response = await axios.get(`http://localhost:8000/Products?_start=${offset}&_limit=8`);
    res.json(response.data);
  } catch (error) {
    console.error("Error loading more products:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/search', async (req, res) => {
  try {
      const keyword = req.body.keyword;
      const response = await axios.get(`http://localhost:8000/Products`);
      const products = response.data.filter(product => 
          product.name.toLowerCase().includes(keyword.toLowerCase())
      );
      res.json(products);
  } catch (error) {
      console.error("Error during search:", error);
      res.status(500).send('Internal Server Error');
  }
});

//login (admin)
app.post('/admin', async (req, res, next) => {
  const { userName, password } = req.body;

  try {
    const response = await axios.get(`http://localhost:8000/users?userName=${userName}`);
    const admin = response.data.find(user => user.userName === userName && user.admin === 'y');

    if (!admin) {
      return res.status(400).send('Tên đăng nhập không tồn tại hoặc không phải là admin');
    }

    const checkPass = await bcrypt.compare(password, admin.password);

    if (!checkPass) {
      return res.status(400).send('Mật khẩu không chính xác');
    }
    res.render('Admin')

  } catch (error) {
    console.log(error);
    res.status(500).send('Có lỗi xảy ra');
  }
  });

//đăng nhập
app.post('/login', async (req, res, next) => {
    const { userName, password } = req.body;

    try {
        const response = await axios.get(`http://localhost:8000/users?userName=${userName}`);
        const user = response.data[0];

        if (!user) {
            return res.status(400).send('Tên đăng nhập không tồn tại');
        }
        const checkPass = await bcrypt.compare(password, user.password);

        if (!checkPass) {
            return res.status(400).send('Mật khẩu không chính xác');
        }
        res.render('index')
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Có lỗi xảy ra');
    }
});

// Đăng ký
app.post('/signup', async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
      const userCheck = await axios.get(`http://localhost:8000/users?userName=${userName}`);
      if (userCheck.data.length > 0) {
          return res.status(400).send('Tên đăng nhập đã tồn tại');
      }

      const emailCheck = await axios.get(`http://localhost:8000/users?email=${email}`);
      if (emailCheck.data.length > 0) {
          return res.status(400).send('Email đã tồn tại');
      }

      const saltRounds = 10; 
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = {
          userName,
          email, 
          password: hashedPassword  
      };

      const createUserResponse = await axios.post(`http://localhost:8000/users`, newUser); 
      if (createUserResponse.status === 201) {
          res.status(201).send('Đăng kí thành công');
      } else {
          throw new Error('Không thể tạo người dùng mới');
      }
  } catch (error) {
      console.log(error);
      res.status(500).send('Có lỗi xảy ra khi đăng ký');
  }
});

app.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;

    try {
      const response = await axios.get(`http://localhost:8000/users?email=${email}`);
      const user = response.data[0];
  // Make sure user exist in database
  if (!user) {
    res.send('Email không tồn tại trong hệ thống, vui lòng nhập lại hoặc đăng kí tài khoản');
    return;
  }

  // User exist and now create a One time link valid for 15minutes
  const secret = JWT_SECRET + user.password;
  const payload = {
    email: user.email,
    id: user.id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: '15m' });
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;

  const mailOptions = {
    from: 'khai.sendmail@gmail.com',
    to: user.email,
    subject: 'Password Reset Link',
    text: `Here is your password reset link: ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send('Error sending email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Password reset link has been sent to your email...');
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
    const response = await axios.get(`http://localhost:8000/users?id=${id}`);
    const user = response.data[0];

    if (!user) {
      res.send('ID không hợp lệ');
      return;
    }

    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);
    res.render('reset-password', { email: user.email });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

app.post('/reset-password/:id/:token', async (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  try {
    const response = await axios.get(`http://localhost:8000/users?id=${id}`);
    const user = response.data[0];

    if (!user) {
      res.send('ID không hợp lệ');
      return;
    }

    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    if (password !== password2) {
      res.send('Mật khẩu không khớp, vui lòng back lại trang trước');
      return;
    }

    // Mã hoá mật khẩu mới
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Cập nhật mật khẩu mới trong JSON Server
    await axios.patch(`http://localhost:8000/users/${id}`, { password: hashedPassword });

    res.send('mật khẩu đã được cập nhật thành công, vui lòng đăng nhập lại');
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});




app.listen(3000, () => console.log('🚀 @ http://localhost:3000'));