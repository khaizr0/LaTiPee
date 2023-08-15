const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const dbFilePath = path.join(__dirname, '/Server/db.json');

app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '/user/Reset.html'));
});

app.post('/send-otp', (req, res) => {
  const email = req.body.email;
  const otp = Math.floor(100000 + Math.random() * 900000);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'your.email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your.email@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send('OTP sent successfully.');
    }
  });
});

// Handle changing password
app.post('/change-password', (req, res) => {
  const newPassword = req.body.newPassword;
  const userIdToUpdate = 1; // Change this to the appropriate user ID

  const rawData = fs.readFileSync(dbFilePath);
  const data = JSON.parse(rawData);

  const userToUpdate = data.user.find(user => user.id === userIdToUpdate);
  if (userToUpdate) {
    userToUpdate.passWord = newPassword;
    const updatedData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dbFilePath, updatedData);
    res.send('Password changed successfully.');
  } else {
    res.send(`User with ID ${userIdToUpdate} not found.`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
