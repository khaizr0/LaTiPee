const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();

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

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/forgot-password', (req, res, next) => {
  res.render('forgot-password');
});
app.get('/login', (req, res, next) => {
  res.render('login');
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

    // Cập nhật mật khẩu mới trong JSON Server
    await axios.patch(`http://localhost:8000/users/${id}`, { password });

    res.send('mật khẩu đã được cập nhật thành công, vui lòng đăng nhập lại');
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

app.listen(3000, () => console.log('🚀 @ http://localhost:3000'));