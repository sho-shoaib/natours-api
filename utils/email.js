const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: 'Shoaib Shaikh <shaikhsho292@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
