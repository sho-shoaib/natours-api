const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const ThrowError = require('../utils/ErrorClass.js');
const { promisify } = require('util');
const sendEmail = require('../utils/email.js');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new ThrowError('Please provide an email and password', 400);
    next(err);
    return;
  }

  const foundUser = await User.findOne({ email }).select('+password');

  if (
    !foundUser ||
    !(await foundUser.correctPassword(password, foundUser.password))
  ) {
    return next(new ThrowError('Incorrect email or password', 401));
  }

  const token = signToken(foundUser._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';

  // 1) Getting token and checking if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new ThrowError('You are not logged in. Please login to get request'),
      401
    );
    return;
  }

  // 2) Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    next(new ThrowError('User no longer exists', 401));
    return;
  }

  // 4) Check if user changed password or token was issued
  const passwordChanged = user.changedPasswordAfter(decoded.iat);
  if (passwordChanged) {
    next(new ThrowError('Invalid Token. Please login again', 401));
  }

  // 5) Send request
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new ThrowError('You do not have access to this route', 401);
      next(err);
      return;
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new ThrowError('Invalid Email Provided', 401));
    return;
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  // 3) Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;

  const message = `
  <div style="font-family:sans-serif">
    <p>Forgot your password? Set a new password from this link:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you didn't forget your password, please ignore this email!</p>
  </div>
  `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset link, valid for 10 minutes.',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save();

    next(new ThrowError('There was an error sending the email', 500));
    return;
  }

  res.status(200).json({
    status: 'success',
    message: 'Link sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  // 2) If there is a user and the token has not expired, set the new password
  if (!user) {
    next(new ThrowError('Token is invalid or has expired', 400));
    return;
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  console.log(user.passwordResetTokenExpire);
  await user.save();

  // 3) Update the changedPasswordAt property for the user

  // 4) Log the user in and send the jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});
