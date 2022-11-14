const express = require('express');
const { getAllUsers } = require('./../controllers/userControllers.js');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
} = require('./../controllers/authController.js');

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgot').post(forgotPassword);
router.route('/reset-password/:resetToken').patch(resetPassword);

module.exports = router;
