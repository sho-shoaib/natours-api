const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    dataLength: users.length,
    data: {
      users,
    },
  });
});
